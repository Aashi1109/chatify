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
import { IUser } from "@definitions/interfaces";
import { Conversation, Message, UserConversationMessage } from "@models";
import { RedisMessageCache, RedisUserCache } from "@redis";
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
const MESSAGE_UPDATE_BUFFER_KEY = "update";
const MESSAGE_BATCH_SIZE = 2000;
const MESSAGE_FLUSH_INTERVAL = 5000;
let bufferCheckCounter = 0;
let messageBufferSaveIntervalID: NodeJS.Timeout;

const retry = withRetry({ maxAttempts: 5, delayMs: 1000, maxDelayMs: 10000 });

const rooms = new Set();
const messagesCreateCache = new RedisMessageCache("messages:buffer");
const messagesUpdateCache = new RedisMessageCache("messages:update");

const userUpdateCache = new RedisUserCache("user_updates");

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

const saveFlushMessagesBuffer = async () => {
  const messages = await messagesCreateCache.getAllMessages();

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
      await Message.insertMany(batch, { ordered: false });
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
    const { _id } = socket.request.user;

    // make user online
    UserService.updateUser(_id, { lastSeenAt: null, isActive: true })
      .then(async (data) => {
        console.log(`User status updated to ${_id}: true`);
        await userUpdateCache.storeUserUpdate(_id, data);
      })
      .catch((error) => {
        logger.error(`Error updating user status: ${error}`);
      });

    // find such UserConversationMessage which is undelivered and not read and mark them as delivered
    const undeliveredMessagesUpdateResult =
      await UserConversationMessage.updateMany(
        {
          user: _id,
          deliveredAt: null,
          readAt: null,
        },
        { deliveredAt: new Date() },
        { new: true }
      );

    logger.debug(
      `Updated ${undeliveredMessagesUpdateResult.modifiedCount} undelivered messages`
    );

    createJoinRoom(socket, `user:${_id}`);

    await emitUserUpdatesToConversations(_id, socket, {
      isActive: true,
    });

    socket.on(ESocketMessageEvents.TYPING, async (request, cb) => {
      const { conversationId, isTyping } = request || {};
      logger.debug(`User ${_id} typing:${isTyping}`);

      let existingConversation = await Conversation.findById(conversationId);

      if (!existingConversation)
        return cb?.({ error: "Conversation not found" });

      const filteredParticipants = filterParticipants(
        existingConversation.participants.map((participant) =>
          participant.toString()
        ),
        _id
      );

      filteredParticipants.map((participant) => {
        socket.to(`user:${participant}`).emit(ESocketMessageEvents.TYPING, {
          data: { conversationId, isTyping },
        });
      });

      cb?.({ data: { conversationId, isTyping } });
    });

    socket.on(ESocketMessageEvents.NEW_MESSAGE, async (request, cb) => {
      try {
        let { conversationId, content, type, category } = request || {};
        logger.debug(`New message from user ${_id} in chat ${conversationId}`);

        messageBufferSaveIntervalID ??= initPeriodicMessagesSave();

        if (!conversationId)
          return cb?.({ error: "Conversation id is required" });
        let existingConversation = await Conversation.findById(conversationId);

        if (!existingConversation)
          return cb?.({ error: "Conversation not found" });

        conversationId = existingConversation._id?.toString();
        const filteredParticipants = filterParticipants(
          existingConversation.participants.map((participant) =>
            participant.toString()
          ),
          _id
        );

        const newMessageCreateData = {
          _id: new Types.ObjectId(),
          conversation: conversationId,
          content,
          type,
          user: _id,
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

        await messagesCreateCache.methods.setList(
          MESSAGE_SAVE_BUFFER_KEY,
          jnstringify(newMessageCreateData),
          1000
        );

        existingConversation.lastMessage = newMessageCreateData._id;
        await existingConversation.save();

        const responseData = {
          data: {
            conversationId,
            message: {
              ...newMessageCreateData,
            },
          },
        };

        filteredParticipants.map((participant) => {
          socket
            .to(`user:${participant}`)
            .emit(ESocketMessageEvents.NEW_MESSAGE, {
              ...responseData,
            });
        });
        cb?.({ ...responseData });
      } catch (error) {
        logger.error(`Error sending new message`, error);
        cb?.({ error: error?.message || "Something went wrong" });
      }
    });

    socket.on(ESocketMessageEvents.MESSAGE_UPDATE, async (request, cb) => {
      try {
        const { messages, conversationId, content, readAt } = request || {};

        if (!messages.length || !conversationId || !content)
          return cb?.({
            error: "Messages, conversation id and content are required",
          });

        let deliveredAt = null;

        if (rooms.has(`user:${_id}`)) deliveredAt = new Date();

        const messageUpdateData = messages.map((id: string) => ({
          messageId: id,
          conversationId,
          content,
          readAt,
          deliveredAt,
        }));

        await messagesUpdateCache.methods.setListBulk(
          MESSAGE_UPDATE_BUFFER_KEY,
          messageUpdateData.map((m: object) => jnstringify(m))
        );
        cb?.({ data: messageUpdateData });
      } catch (error) {
        logger.error(`Error updating message`, error);
        cb?.({ error: error?.message || "Something went wrong" });
      }
    });

    socket.on(ESocketConnectionEvents.DISCONNECT, async () => {
      logger.info(`User ${_id} disconnected`);
      socket.leave(`user:${_id}`);
      removeRoom(`user:${_id}`);
      await _retrySaveFlushMessagesBuffer();
      await emitUserUpdatesToConversations(_id, socket, {
        isActive: false,
      });

      UserService.updateUser(_id, { lastSeenAt: new Date(), isActive: false })
        .then(async (data) => {
          logger.info(`User status updated to ${_id}: false`);
        })
        .catch((error) => {
          logger.error(`Error updating user status: ${error}`);
        });
    });
  });

  return io;
}
