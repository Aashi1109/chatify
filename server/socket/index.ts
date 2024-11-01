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
import { UserService } from "@services";
import socketUserParser from "@middlewares/socketUserParser";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { IUser } from "@definitions/interfaces";
import { Conversation, Message } from "@models";

interface CustomSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, IUser> {
  request: {
    user: IUser;
  };
}

const rooms = new Set();

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

export function initializeSocket(server) {
  const io = new Server(server, { cors: { ...config.corsOptions } });

  io.use(socketUserParser);

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
      logger.info(`User ${_id} is typing`);

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

        const newMessage = await Message.create({
          conversation: conversationId,
          content,
          type,
          user: _id,
          category: category || EMessageCategory.User,
        });
        await newMessage.save();

        existingConversation.lastMessage = newMessage._id;
        await existingConversation.save();

        const responseData = {
          data: {
            conversationId,
            message: {
              ...newMessage?.toObject(),
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
        cb?.({ error });
      }
    });

    socket.on(ESocketConnectionEvents.DISCONNECT, () => {
      logger.info(`User ${_id} disconnected`);
      socket.leave(`user:${_id}`);
      removeRoom(`user:${_id}`);
    });
  });

  return io;
}
