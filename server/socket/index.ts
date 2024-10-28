import { Server, Socket } from "socket.io";
import config from "@config";
import {
  ESocketConnectionEvents,
  ESocketGroupEvents,
  ESocketMessageEvents,
} from "@definitions/enums";
import logger from "@logger";
import { ChatsService, MessageService, UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IUser } from "@definitions/interfaces";

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

    // Event listeners for this socket
    socket.on(ESocketGroupEvents.GROUP_JOINED, (data) => {
      logger.info(`User ${_id} joined group`);
    });

    socket.on(ESocketGroupEvents.GROUP_LEFT, (data) => {
      logger.info(`User ${_id} left group`);
    });

    socket.on(ESocketMessageEvents.TYPING, (data) => {
      logger.info(`User ${_id} is typing`);
    });

    socket.on(ESocketMessageEvents.NEW_MESSAGE, async (request, cb) => {
      try {
        let { chatId, content, type, receiverId } = request || {};
        let existingChat = (
          await ChatsService.getChatsByFilter({ userId: _id, receiverId })
        )?.[0];

        if (!existingChat) {
          existingChat = await ChatsService.createChat(_id, receiverId, []);
        }

        chatId = existingChat._id;

        logger.debug(`New message from user ${_id} in chat ${chatId}`);
        socket.join(chatId);

        if (!rooms.has(chatId)) rooms.add(chatId);
        const newMessage = await MessageService.create({
          chatId,
          content,
          type,
          userId: _id,
        });

        await ChatsService.updateChatById(existingChat._id?.toString(), {
          messages: [newMessage._id],
          optype: "add",
        });

        const responseData = {
          data: {
            chatId,
            message: {
              ...newMessage,
            },
          },
        };

        socket.to(chatId).emit("dashboard:chats", { ...responseData });
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
