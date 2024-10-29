import { Server, Socket } from "socket.io";
import config from "@config";
import {
  EConversationEvents,
  EMessageCategory,
  ESocketConnectionEvents,
  ESocketGroupEvents,
  ESocketMessageEvents,
} from "@definitions/enums";
import logger from "@logger";
import { ConversationService, MessageService, UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IUser } from "@definitions/interfaces";
import { Conversation } from "@models";

interface CustomSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, IUser> {
  request: {
    user: IUser;
  };
}

const rooms = new Set();

export function initializeSocket(server) {
  const io = new Server(server, { cors: { ...config.corsOptions } });

  io.use(socketUserParser);

  io.on(ESocketConnectionEvents.CONNECT, (socket: CustomSocket) => {
    logger.info(`Connected ${socket.id}`);
    const { _id } = socket.request.user;

    // make user online
    UserService.updateUser(_id, { lastSeenAt: null, isActive: true })
      .then(() => {
        console.log(`Socket object: ${socket.data}`);
      })
      .catch((error) => {
        logger.error(`Error updating user status: ${error}`);
      });

    socket.on(EConversationEvents.JoinConversation, (request, cb) => {
      const { chatId } = request || {};
      logger.debug(`User ${_id} joined room ${chatId}`);
      if (!rooms.has(chatId)) rooms.add(chatId);
      socket.join(chatId);
      cb?.({ data: true });
    });

    socket.on(ESocketMessageEvents.TYPING, (request, cb) => {
      const { chatId, isTyping } = request || {};
      logger.info(`User ${_id} is typing`);
      socket.to(chatId).emit(ESocketMessageEvents.TYPING, {
        data: isTyping,
      });
      cb?.({ data: true });
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
        let { conversationId, content, type, participants, category } =
          request || {};
        let existingConversation = await Conversation.findOne({
          participants: { $in: [...participants, _id] },
        });

        if (!existingConversation)
          return cb?.({ error: "Conversation not found" });

        conversationId = existingConversation._id?.toString();

        logger.debug(`New message from user ${_id} in chat ${conversationId}`);

        if (!rooms.has(conversationId)) rooms.add(conversationId);
        const newMessage = await MessageService.create({
          conversation: conversationId,
          content,
          type,
          user: _id,
          category: category || EMessageCategory.User,
        });

        const responseData = {
          data: {
            chatId: conversationId,
            message: {
              ...newMessage,
            },
          },
        };

        socket.to(conversationId).emit(ESocketMessageEvents.NEW_MESSAGE, {
          ...responseData,
        });
        cb?.({ ...responseData });
      } catch (error) {
        cb?.({ error });
      }
    });

    socket.on(ESocketConnectionEvents.DISCONNECT, () => {
      logger.info(`User ${_id} disconnected`);
    });
  });

  return io;
}
