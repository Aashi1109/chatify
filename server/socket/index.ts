import { Server, Socket } from "socket.io";
import config from "@config";
import {
  EMessageCategory,
  ESocketConnectionEvents,
  ESocketGroupEvents,
  ESocketMessageEvents,
} from "@definitions/enums";
import logger from "@logger";
import { UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IUser } from "@definitions/interfaces";
import { Conversation, Message } from "@models";
import RedisMessageCache from "@redis";
import { Types } from "mongoose";
import { jnstringify } from "@lib/utils";
import { IncomingMessage } from "http";

const MESSAGE_SAVE_BUFFER_KEY = "message_save_buffer";
const MESSAGE_BATCH_SIZE = 2000;
const MESSAGE_FLUSH_INTERVAL = 5000;

interface CustomSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, IUser> {
  request: IncomingMessage & {
    user: IUser;
  };
}

const rooms = new Set();
const redisMessageCache = new RedisMessageCache();

const createJoinRoom = (socket: CustomSocket, room: string) => {
  socket.join(room);
  rooms.add(room);
};

const removeRoom = (room: string) => {
  rooms.delete(room);
};

const filterParticipants = (participants: string[], currentUserId: string) => {
  return participants.filter(
    (participant) => participant !== currentUserId?.toString()
  );
};

const saveFlushMessagesBuffer = async () => {
  const messages = await redisMessageCache.getAllMessages();

  if (messages.length === 0) {
    logger.debug(`Buffer empty, no messages to save`);
    return;
  }

  try {
    for (let i = 0; i < messages.length; i += MESSAGE_BATCH_SIZE) {
      const batch = messages.slice(i, i + MESSAGE_BATCH_SIZE);
      await Message.insertMany(batch, { ordered: false });
      logger.info(`Saved batch of ${batch.length} messages`);
    }

    await redisMessageCache.methods.deleteKey(MESSAGE_SAVE_BUFFER_KEY);
  } catch (error) {
    logger.error(`Error saving messages buffer`, error);
  }
};

const initPeriodicMessagesSave = () => {
  return setInterval(saveFlushMessagesBuffer, MESSAGE_FLUSH_INTERVAL);
};

export function initializeSocket(server) {
  const io = new Server(server, { cors: { ...config.corsOptions } });

  io.use(socketUserParser);
  const intervalId = initPeriodicMessagesSave();

  io.on(ESocketConnectionEvents.CONNECT, (socket: CustomSocket) => {
    logger.info(`Connected ${socket.id}`);
    const { _id } = socket.request.user;

    // make user online
    UserService.updateUser(_id, { lastSeenAt: null, isActive: true })
      .then(() => {
        console.log(`User status updated to ${_id}: true`);
      })
      .catch((error) => {
        logger.error(`Error updating user status: ${error}`);
      });

    createJoinRoom(socket, `user:${_id}`);

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

    // Event listeners for this socket
    socket.on(ESocketGroupEvents.GROUP_JOINED, (data) => {
      logger.info(`User ${_id} joined group`);
    });

    socket.on(ESocketGroupEvents.GROUP_LEFT, (data) => {
      logger.info(`User ${_id} left group`);
    });

    socket.on(ESocketMessageEvents.NEW_MESSAGE, async (request, cb) => {
      try {
        let { conversationId, content, type, category } = request || {};
        logger.debug(`New message from user ${_id} in chat ${conversationId}`);

        if (!conversationId)
          return cb?.({ error: "Conversation id is required" });
        let existingConversation = await Conversation.findById(conversationId);

        if (!existingConversation)
          return cb?.({ error: "Conversation not found" });

        conversationId = existingConversation._id?.toString();

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

        const bufferSize = await redisMessageCache.methods.getBufferSize(
          MESSAGE_SAVE_BUFFER_KEY
        );

        if (bufferSize >= MESSAGE_BATCH_SIZE) {
          await saveFlushMessagesBuffer();
        }

        await redisMessageCache.methods.setList(
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

        const filteredParticipants = filterParticipants(
          existingConversation.participants.map((participant) =>
            participant.toString()
          ),
          _id
        );

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

    socket.on(ESocketConnectionEvents.DISCONNECT, () => {
      logger.info(`User ${_id} disconnected`);
      socket.leave(`user:${_id}`);
      removeRoom(`user:${_id}`);
      saveFlushMessagesBuffer();
    });
  });

  return io;
}
