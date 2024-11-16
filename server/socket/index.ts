import { Server, Socket } from "socket.io";
import config from "@config";
import {
  EMessageCategory,
  ESocketConnectionEvents,
  ESocketMessageEvents,
  ESocketUserEvents,
} from "@definitions/enums";
import logger from "@logger";
import { ConversationService, UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IConversation, IUser } from "@definitions/interfaces";
import { Conversation, Message, MessageStats } from "@models";
import { RedisMessageCache, RedisCommonCache } from "@redis";
import { Types } from "mongoose";
import { jnstringify } from "@lib/utils";
import { IncomingMessage } from "http";
import { withRetry } from "@lib/helpers";

interface CustomSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, IUser> {
  request: IncomingMessage & {
    user: IUser;
  };
}

const MESSAGE_SAVE_BUFFER_KEY = "create";
const MESSAGE_BATCH_SIZE = 2000;
const MESSAGE_FLUSH_INTERVAL = 5000;
let bufferCheckCounter = 0;
let messageBufferSaveIntervalID: NodeJS.Timeout;

const retry = withRetry({ maxAttempts: 5, delayMs: 1000, maxDelayMs: 10000 });

const rooms = new Set();
const messagesCreateCache = new RedisMessageCache("messages:create");
const messagesUpdateCache = new RedisMessageCache("messages:update");

const commonCache = new RedisCommonCache("sct");

const createJoinRoom = (socket: CustomSocket, room: string) => {
  socket.join(room);
  rooms.add(room);
};

const removeRoom = (room: string) => {
  rooms.delete(room);
};

const filterParticipants = (participants: string[], currentUserId: string) => {
  const filteredParticipants = participants.filter(
    (participant) => participant !== currentUserId?.toString()
  );

  return [...new Set(filteredParticipants)];
};

const filterFormMessagesAndStats = (
  batch: Record<string, any>[],
  uups: Record<string, any>[],
  conversations: Record<string, any>[]
) => {
  const result = batch.reduce(
    (acc, message) => {
      const { deliveredAt, readAt, sentAt, ...restMessage } = message;
      acc.messages.push(restMessage);

      const participants = conversations[message.conversation]?.participants;

      participants.map((participant) => {
        const fromCurrentUser = participant === message.user;

        if (fromCurrentUser) return;

        const isUserActive = uups[participant]?.isActive;

        acc.userConversationMessages.push({
          message: restMessage._id,
          user: participant,
          conversation: restMessage.conversation,
          deliveredAt: isUserActive ? new Date() : deliveredAt,
          sentAt,
          readAt,
        });
      });

      return acc;
    },
    { messages: [], userConversationMessages: [] }
  );

  return result;
};

const saveFlushMessagesBuffer = async () => {
  const [messages, uup, conversations] = await Promise.all([
    messagesCreateCache.getAllMessages(),
    commonCache.methods.hGet(`uup`),
    commonCache.methods.hGet(`conversation`),
  ]);

  if (messages.length === 0) {
    logger.debug(`Buffer empty, no messages to save`);
    bufferCheckCounter++;

    if (bufferCheckCounter > 3) {
      logger.debug(`Buffer check counter reached 3, stopping interval`);
      clearInterval(messageBufferSaveIntervalID);
      messageBufferSaveIntervalID = null;
      bufferCheckCounter = 0;
    }
    return;
  }

  try {
    for (let i = 0; i < messages.length; i += MESSAGE_BATCH_SIZE) {
      const batch = messages.slice(i, i + MESSAGE_BATCH_SIZE);
      const { messages: _messages, userConversationMessages } =
        filterFormMessagesAndStats(batch, uup, conversations);

      logger.debug(_messages);
      await Promise.all([
        Message.insertMany(_messages, { ordered: false }),
        MessageStats.insertMany(userConversationMessages, {
          ordered: false,
        }),
      ]);
      logger.info(`Saved batch of ${batch.length} messages`);
    }
    await messagesCreateCache.methods.deleteKey(MESSAGE_SAVE_BUFFER_KEY);
  } catch (error) {
    logger.error(`Error saving messages buffer`, error);
  }
};

const _retrySaveFlushMessagesBuffer = retry(saveFlushMessagesBuffer);

const initPeriodicMessagesSave = () => {
  logger.debug(`Initializing periodic messages save`);
  return setInterval(_retrySaveFlushMessagesBuffer, MESSAGE_FLUSH_INTERVAL);
};

async function emitUserUpdatesToConversations(
  _id: string,
  socket: CustomSocket,
  data: any
) {
  const conversations = await ConversationService.getConversationByFilter({
    participants: [_id],
  });
  const participantsId = conversations.flatMap((c) =>
    c.participants.flatMap((f) => f._id?.toString())
  );

  const uniqueParticipantsId = [...new Set(participantsId)];
  const rooms = uniqueParticipantsId.map((p) => `user:${p}`);

  socket.to([...rooms]).emit(ESocketUserEvents.UPDATES, {
    data: {
      userId: _id,
      data: { ...data },
    },
  });
}

export function initializeSocket(server) {
  const io = new Server(server, { cors: { ...config.corsOptions } });

  io.use(socketUserParser);
  messageBufferSaveIntervalID = initPeriodicMessagesSave();

  io.on(ESocketConnectionEvents.CONNECT, async (socket: CustomSocket) => {
    logger.info(`Connected ${socket.id}`);
    const socketUserId = socket.request.user._id?.toString();

    const undeliveredMessagesUpdateResult = MessageStats.updateMany(
      {
        user: socketUserId,
        deliveredAt: null,
        readAt: null,
      },
      { deliveredAt: new Date() }
    );

    createJoinRoom(socket, `user:${socketUserId}`);

    await Promise.allSettled([
      undeliveredMessagesUpdateResult,
      commonCache.methods.hSet(
        `uup`,
        socketUserId,
        {
          isActive: true,
        },
        3600
      ),
      emitUserUpdatesToConversations(socketUserId, socket, {
        isActive: true,
      }),
    ]);

    logger.debug(
      `Updated ${undeliveredMessagesUpdateResult} undelivered messages`
    );

    socket.on(ESocketMessageEvents.TYPING, async (request, cb) => {
      const { conversationId, isTyping } = request || {};
      logger.debug(`User ${socketUserId} typing:${isTyping}`);

      let existingConversation = await commonCache.methods.hGet(
        `conversation`,
        conversationId
      );

      if (!existingConversation)
        return cb?.({ error: "Conversation not found" });

      const filteredParticipants = filterParticipants(
        existingConversation.participants.map((participant) =>
          participant.toString()
        ),
        socketUserId
      );

      filteredParticipants.map((participant) => {
        socket.to(`user:${participant}`).emit(ESocketMessageEvents.TYPING, {
          data: { conversationId, isTyping, user: socket.request.user },
        });
      });

      cb?.({ data: { conversationId, isTyping, user: socket.request.user } });
    });

    socket.on(ESocketMessageEvents.NEW_MESSAGE, async (request, cb) => {
      try {
        let { conversationId, content, type, category } = request || {};
        logger.debug(
          `New message from user ${socketUserId} in chat ${conversationId}`
        );

        messageBufferSaveIntervalID ??= initPeriodicMessagesSave();
        let isRedisInstance = true;

        if (!conversationId)
          return cb?.({ error: "Conversation id is required" });

        // first get in redis then in database
        let existingConversation = await commonCache.methods.hGet(
          `conversation`,
          conversationId
        );

        if (!existingConversation) {
          existingConversation = await Conversation.findById(conversationId);
          isRedisInstance = false;
        }

        if (!existingConversation)
          return cb?.({ error: "Conversation not found" });

        conversationId = existingConversation._id?.toString();
        const filteredParticipants = filterParticipants(
          existingConversation.participants.map((participant) =>
            participant.toString()
          ),
          socketUserId
        );

        const newMessageCreateData = {
          _id: new Types.ObjectId(),
          conversation: conversationId,
          content,
          type,
          user: socketUserId,
          category: category || EMessageCategory.User,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // TODO implement if necessary
        // const bufferSize = await messagesCreateCache.methods.getBufferSize(
        //   MESSAGE_SAVE_BUFFER_KEY
        // );

        // if (bufferSize >= MESSAGE_BATCH_SIZE) {
        //   await _retrySaveFlushMessagesBuffer();
        // }
        await Promise.allSettled([
          ...(!isRedisInstance
            ? [
                existingConversation.save(),
                commonCache.methods.hSet(
                  `conversation`,
                  conversationId,
                  {
                    ...existingConversation.toObject(),
                    lastMessage: newMessageCreateData._id,
                  },
                  24000
                ),
              ]
            : []),
          messagesCreateCache.methods.setList(
            MESSAGE_SAVE_BUFFER_KEY,
            newMessageCreateData,
            1000
          ),
        ]);

        const responseData = {
          data: {
            conversationId,
            message: newMessageCreateData,
          },
        };

        filteredParticipants.map((participant) => {
          socket
            .to(`user:${participant}`)
            .emit(ESocketMessageEvents.NEW_MESSAGE, responseData);
        });
        cb?.({ ...responseData });
      } catch (error) {
        logger.error(`Error sending new message`, error);
        cb?.({ error: error?.message || "Something went wrong" });
      }
    });

    // TODO: feature not implemented yet on frontend
    // socket.on(ESocketMessageEvents.MESSAGE_UPDATE, async (request, cb) => {
    //   try {
    //     const { messages, conversationId, content, readAt } = request || {};

    //     if (!messages.length || !conversationId || !content)
    //       return cb?.({
    //         error: "Messages, conversation id and content are required",
    //       });

    //     let deliveredAt = null;

    //     if (rooms.has(`user:${_id}`)) deliveredAt = new Date();

    //     const messageUpdateData = messages.map((id: string) => ({
    //       messageId: id,
    //       conversationId,
    //       content,
    //       readAt,
    //       deliveredAt,
    //     }));

    //     await messagesUpdateCache.methods.setListBulk(
    //       MESSAGE_UPDATE_BUFFER_KEY,
    //       messageUpdateData.map((m: object) => jnstringify(m))
    //     );
    //     cb?.({ data: messageUpdateData });
    //   } catch (error) {
    //     logger.error(`Error updating message`, error);
    //     cb?.({ error: error?.message || "Something went wrong" });
    //   }
    // });

    socket.on(ESocketConnectionEvents.DISCONNECT, async () => {
      logger.info(`User ${socketUserId} disconnected`);
      socket.leave(`user:${socketUserId}`);
      removeRoom(`user:${socketUserId}`);

      const lastSeenAt = new Date();

      await Promise.allSettled([
        _retrySaveFlushMessagesBuffer(),
        commonCache.methods.hSet(
          `uup`,
          socketUserId?.toString(),
          {
            isActive: false,
            lastSeenAt,
          },
          3600
        ),
        emitUserUpdatesToConversations(socketUserId, socket, {
          isActive: false,
          lastSeenAt,
        }),
      ]);
    });
  });

  return io;
}
