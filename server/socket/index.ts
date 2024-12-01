import { Server, Socket } from "socket.io";
import config from "@config";
import {
  EConversationEvents,
  EMessageCategory,
  ESocketConnectionEvents,
  ESocketMessageEvents,
  ESocketUserEvents,
} from "@definitions/enums";
import logger from "@logger";
import { ConversationService, UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IMessage, IObjectKeys, IUser } from "@definitions/interfaces";
import { Conversation, Message } from "@models";
import { RedisMessageCache, RedisCommonCache } from "@redis";
import { Types } from "mongoose";
import { jnstringify } from "@lib/utils";
import { IncomingMessage } from "http";
import { withRetry } from "@lib/helpers";
import { isEmpty, isNil, isNull } from "lodash";
import { messagesUpdateTransformer } from "./lib/utils";

interface CustomSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, IUser> {
  request: IncomingMessage & {
    user: IUser;
  };
}

const MESSAGE_SAVE_BUFFER_KEY = "messages:create";
const MESSAGE_BATCH_SIZE = 2000;
const MESSAGE_FLUSH_INTERVAL = 5000;
let bufferCheckCounter = 0;
let messageBufferSaveIntervalID: NodeJS.Timeout;

const retry = withRetry({ maxAttempts: 5, delayMs: 1000, maxDelayMs: 10000 });

const rooms = new Set();

const commonCache = new RedisCommonCache();
const socketCache = new RedisCommonCache("sct");

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
  const messages = await socketCache.methods.getAllListItems({
    pattern: MESSAGE_SAVE_BUFFER_KEY,
  });

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

      const result = await Message.insertMany(batch, { ordered: false });
      logger.debug(`Message bulk insert result: ${jnstringify(result)}`);

      const conversationUpdates: Record<string, IMessage | null> = batch.reduce(
        (acc, message) => {
          if (
            !acc[message.conversation] ||
            message.sentAt > acc[message.conversation].sentAt
          ) {
            acc[message.conversation] = message;
          }
          return acc;
        },
        {}
      );

      const redisUpdates = [];
      const bulkOps = Object.entries(conversationUpdates).map(
        ([conversationId, message]) => {
          redisUpdates.push({
            key: `conversations:${conversationId}`,
            value: { lastMessage: message?._id },
          });
          return {
            updateOne: {
              filter: { _id: conversationId },
              update: { $set: { lastMessage: message?._id } },
            },
          };
        }
      );

      if (bulkOps.length > 0) {
        await Promise.allSettled([
          Conversation.bulkWrite(bulkOps, { ordered: false }),
          commonCache.methods.hSetBulk(`conversation-updates`, redisUpdates),
        ]);
        logger.info(`Updated lastMessage for ${bulkOps.length} conversations`);
      }

      logger.info(`Saved batch of ${batch.length} messages`);
    }
    await socketCache.methods.deleteKey(MESSAGE_SAVE_BUFFER_KEY);
  } catch (error) {
    logger.error(`Error saving messages buffer`, error);
  }
};

const _retrySaveFlushMessagesBuffer = retry(saveFlushMessagesBuffer);

const initPeriodicMessagesSave = () => {
  logger.debug(`Initializing periodic messages save`);
  return setInterval(_retrySaveFlushMessagesBuffer, MESSAGE_FLUSH_INTERVAL);
};

async function emitUpdatesForConversations(
  socketUserId: string,
  socket: CustomSocket,
  data: {
    user?: { id?: string; data: IObjectKeys };
    message?: { id?: string; data: IObjectKeys };
    conversation?: { id?: string; data: IObjectKeys };
  }
) {
  try {
    const { user, message, conversation } = data;
    logger.debug(`Data for emitting updates: ${jnstringify(data)}`);
    if (!(user?.data || message?.data || conversation?.data)) return;

    let participants = await commonCache.methods.hGet(
      `user-conversation-participants`,
      socketUserId
    );

    if (!participants) {
      const conversations = await ConversationService.getConversationByFilter({
        participants: [socketUserId],
      });

      const participantsId: string[] = conversations.flatMap((c) =>
        c.participants.flatMap((f) => f._id?.toString())
      );
      conversations.length &&
        (await commonCache.methods.hSet(
          `user-conversation-participants`,
          socketUserId,
          participantsId,
          60 * 5
        ));
    }

    const uniqueParticipantsId = [...new Set(participants)];

    const activeParticipants = uniqueParticipantsId.filter(
      (id) => id !== socketUserId && rooms.has(`user:${id}`)
    );

    if (activeParticipants.length === 0) return;

    type TSocketEvents =
      | ESocketUserEvents
      | ESocketMessageEvents
      | EConversationEvents;

    const updatesToEmit = Object.entries(data).reduce((acc, [key, value]) => {
      if (isEmpty(value.data) || isNil(value.data)) return acc;

      let eventConfig: { event: TSocketEvents; idKey: string } = {
        event: ESocketUserEvents.UPDATES,
        idKey: "userId",
      };

      switch (key) {
        case "message":
        case "conversation":
          eventConfig = {
            event:
              key === "message"
                ? ESocketMessageEvents.UPDATE
                : EConversationEvents.Update,
            idKey: "conversationId",
          };
          break;
      }

      acc[eventConfig.event] = {
        [eventConfig.idKey]: value.id,
        data: value.data,
      };
      return acc;
    }, {});

    const _soc = socket.to(activeParticipants.map((id) => `user:${id}`));

    logger.debug(
      `Emitting updates for conversations: ${jnstringify(updatesToEmit)}`
    );

    Object.entries(updatesToEmit).forEach(([key, value]) => {
      _soc.emit(key, { data: value });
    });
  } catch (err) {
    logger.error(`Error emitting updates for conversations`, err);
  }
}

export function initializeSocket(server) {
  const io = new Server(server, { cors: { ...config.corsOptions } });

  io.use(socketUserParser);
  messageBufferSaveIntervalID = initPeriodicMessagesSave();

  io.on(ESocketConnectionEvents.CONNECT, async (socket: CustomSocket) => {
    logger.info(`Connected ${socket.id}`);
    const socketUserId = socket.request.user._id?.toString();

    const messagesToUpdate = await Message.find({
      [`stats.${socketUserId}`]: { $exists: true },
      [`stats.${socketUserId}.deliveredAt`]: null,
    })
      .select("_id conversation stats")
      .lean();
    const deliveredAt = new Date();

    if (messagesToUpdate.length > 0) {
      // Update the stats directly on the found documents
      const bulkOps = messagesToUpdate.map((msg) => ({
        updateOne: {
          filter: { _id: msg._id, conversation: msg.conversation },
          update: {
            $set: {
              [`stats.${socketUserId}.deliveredAt`]: deliveredAt,
            },
          },
        },
      }));

      const undeliveredMessagesUpdateResult = await Message.bulkWrite(bulkOps, {
        ordered: false,
        writeConcern: { w: 0 },
      });

      logger.debug(
        `Updated ${messagesToUpdate.length} messages: ${messagesToUpdate.map(
          (m) => m._id
        )}`
      );
    }

    createJoinRoom(socket, `user:${socketUserId}`);
    const updatedMessages = messagesToUpdate.map((m) => ({
      ...m,
      stats: { ...(m.stats || {}), [socketUserId]: { deliveredAt } },
    }));

    const results = await Promise.allSettled([
      commonCache.methods.hSet(
        `user-updates`,
        socketUserId,
        {
          isActive: true,
        },
        3600
      ),
      emitUpdatesForConversations(socketUserId, socket, {
        user: {
          id: socketUserId,
          data: {
            isActive: true,
          },
        },
        message: {
          id: null,
          data: messagesUpdateTransformer(updatedMessages),
        },
      }),
    ]);

    logger.debug(
      `Updated ${results[0].status} ${results[0]} undelivered messages`
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
        let {
          conversation: conversationId,
          content,
          type,
          category,
        } = request || {};
        logger.debug(
          `New message from user ${socketUserId} in chat ${conversationId}`
        );

        messageBufferSaveIntervalID ??= initPeriodicMessagesSave();

        if (!conversationId)
          return cb?.({ error: "Conversation id is required" });

        // first get in redis then in database
        let existingConversation = await commonCache.methods.getKey(
          `conversation:${conversationId}`
        );

        if (!existingConversation) {
          existingConversation = await Conversation.findById(
            conversationId
          ).lean();
          await commonCache.methods.setString(
            `conversation:${conversationId}`,
            existingConversation,
            24000
          );
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
          stats: {},
        };

        const userStatuses = await commonCache.methods.hGet("uup");

        const stats = filteredParticipants.reduce((acc, par) => {
          const userStatus = userStatuses?.[par];
          acc[par] = {
            deliveredAt: userStatus?.isActive ? new Date().toISOString() : null,
            readAt: null,
          };
          return acc;
        }, {});

        newMessageCreateData.stats = stats;

        // TODO implement if necessary
        // const bufferSize = await messagesCreateCache.methods.getBufferSize(
        //   MESSAGE_SAVE_BUFFER_KEY
        // );

        // if (bufferSize >= MESSAGE_BATCH_SIZE) {
        //   await _retrySaveFlushMessagesBuffer();
        // }
        await Promise.allSettled([
          commonCache.methods.hSet(
            `conversation-updates`,
            conversationId,
            { lastMessage: newMessageCreateData },
            1000
          ),
          socketCache.methods.setList(
            MESSAGE_SAVE_BUFFER_KEY,
            newMessageCreateData,
            1000
          ),
        ]);

        const responseData = {
          data: {
            conversationId: conversationId,
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

    socket.on(ESocketMessageEvents.UPDATE, async (request, cb) => {
      try {
        const { messages, conversation, content, readAt } = request || {};

        if (!(conversation && (content || messages.length)))
          return cb?.({
            error: "Messages, conversation and content are required",
          });

        // Batch update messages using bulkWrite instead of updateMany
        await Message.bulkWrite(
          messages.map((id: string) => ({
            updateOne: {
              filter: { _id: id, conversation: conversation },
              update: { $set: { [`stats.${socketUserId}.readAt`]: readAt } },
            },
          })),
          { ordered: false }
        );

        const messageStats = messages.reduce((acc, id) => {
          acc[id] = { readAt, content };
          return acc;
        }, {});

        cb?.({ data: { conversationId: conversation, data: messageStats } });
      } catch (error) {
        logger.error(`Error updating message`, error);
        cb?.({ error: error?.message || "Something went wrong" });
      }
    });

    socket.on(EConversationEvents.CurrentChatWindow, async (request, cb) => {
      logger.debug(`User ${socketUserId} chat window opened`);
      const { conversation: conversationId } = request || {};

      if (!conversationId)
        return cb?.({ error: "Conversation id is required" });

      await commonCache.methods.hSet(
        `conversation-updates`,
        socketUserId,
        { chatWindowOpenedConversation: conversationId },
        1000
      );
    });

    socket.on(ESocketConnectionEvents.DISCONNECT, async () => {
      logger.info(`User ${socketUserId} disconnected`);
      socket.leave(`user:${socketUserId}`);
      removeRoom(`user:${socketUserId}`);

      const lastSeenAt = new Date().toISOString();

      await Promise.allSettled([
        _retrySaveFlushMessagesBuffer(),
        commonCache.methods.hSet(
          `user-updates`,
          socketUserId?.toString(),
          {
            isActive: false,
            lastSeenAt,
          },
          3600
        ),
        emitUpdatesForConversations(socketUserId, socket, {
          user: {
            id: socketUserId,
            data: {
              isActive: false,
              lastSeenAt,
            },
          },
        }),
      ]);
    });
  });

  return io;
}
