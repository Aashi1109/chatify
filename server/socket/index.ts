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
import { IObjectKeys, IUser } from "@definitions/interfaces";
import { Conversation, Message } from "@models";
import { RedisMessageCache, RedisCommonCache } from "@redis";
import { Types } from "mongoose";
import { jnstringify } from "@lib/utils";
import { IncomingMessage } from "http";
import { withRetry } from "@lib/helpers";
import { isEmpty, isNil, isNull } from "lodash";

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

const saveFlushMessagesBuffer = async () => {
  const messages = await messagesCreateCache.methods.getAllListItems();

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

    let conversations = await commonCache.methods.getAllListItems({
      pattern: `userconversations:${socketUserId}`,
    });

    if (!conversations.length) {
      conversations = await ConversationService.getConversationByFilter({
        participants: [socketUserId],
      });

      conversations.length &&
        (await commonCache.methods.setListBulk(
          `userconversations:${socketUserId}`,
          conversations
        ));
    }

    const participantsId: string[] = conversations.flatMap((c) =>
      c.participants.flatMap((f) => f._id?.toString())
    );

    const uniqueParticipantsId = [...new Set(participantsId)];

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
                : EConversationEvents.UPDATE,
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
      .select("_id stats")
      .lean();
    const deliveredAt = new Date().toISOString();

    if (messagesToUpdate.length > 0) {
      // Update the stats directly on the found documents
      const bulkOps = messagesToUpdate.map((msg) => ({
        updateOne: {
          filter: { _id: msg._id },
          update: {
            $set: {
              [`stats.${socketUserId}.deliveredAt`]: new Date().toISOString(),
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

    const results = await Promise.allSettled([
      commonCache.methods.hSet(
        `uup`,
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
          data: messagesToUpdate.map((m) => ({
            id: m._id,
            data: { stats: { [socketUserId]: { deliveredAt } } },
          })),
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
    socket.on(ESocketMessageEvents.UPDATE, async (request, cb) => {
      try {
        const { messages, conversationId, content, readAt } = request || {};

        if (!(messages.length && conversationId && content))
          return cb?.({
            error: "Messages, conversation id and content are required",
          });

        // Batch update messages using bulkWrite instead of updateMany
        await Message.bulkWrite(
          messages.map((id: string) => ({
            updateOne: {
              filter: { _id: id, conversation: conversationId },
              update: { $set: { [`stats.${socketUserId}.readAt`]: readAt } },
            },
          })),
          { ordered: false }
        );

        const messageStats = messages.reduce((acc, id) => {
          acc[id] = { readAt, content };
          return acc;
        }, {});

        cb?.({ data: { conversationId, data: messageStats } });
      } catch (error) {
        logger.error(`Error updating message`, error);
        cb?.({ error: error?.message || "Something went wrong" });
      }
    });

    socket.on(ESocketConnectionEvents.DISCONNECT, async () => {
      logger.info(`User ${socketUserId} disconnected`);
      socket.leave(`user:${socketUserId}`);
      removeRoom(`user:${socketUserId}`);

      const lastSeenAt = new Date().toISOString();

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
