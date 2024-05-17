import * as cors from "cors";
import * as express from "express";
import { createServer } from "http";
import * as morgan from "morgan";
import * as path from "path";
import { Server } from "socket.io";

import config from "@config";
import authRouter from "@routes/auth.routes";
import chatsRouter from "@routes/chats.routes";
import fileRouter from "@routes/file.routes";
import groupsRouter from "@routes/groups.routes";
import messagesRouter from "@routes/messages.routes";
import userRouter from "@routes/user.routes";

import connectDB from "@database/connectDB";
import {
  ESocketConnectionEvents,
  ESocketGroupEvents,
  ESocketMessageEvents,
  ESocketUserEvents,
} from "@definitions/enums";
import checkJwt from "@middlewares/checkJwt";
import { errorHandler } from "@middlewares/errorHandler";

const app = express();
const server = createServer(app);
const io = new Server(server);

// cors setup to allow requests from the frontend only for now
app.use(cors(config.corsOptions));

app.use(express.static(path.join(__dirname, "public")));

// parse requests of content-type - application/json
app.use(express.json({ limit: config.express.fileSizeLimit }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
    limit: config.express.fileSizeLimit,
  })
);

app.use(morgan(config.morganLogFormat));

// routes setup
app.use(config.apiPrefixes.auth, authRouter);
app.use(config.apiPrefixes.user, userRouter);
app.use(config.apiPrefixes.message, messagesRouter);
app.use(config.apiPrefixes.chats, [checkJwt], chatsRouter);
app.use(config.apiPrefixes.file, fileRouter);
app.use(config.apiPrefixes.groups, [checkJwt], groupsRouter);
// app.use("/api/chat");

// when a user connects
io.on(ESocketConnectionEvents.CONNECT, (socket) => {
  // set user's status online
  // TODO: update user's status
  socket.emit(ESocketUserEvents.ONLINE, () => {});
  // do something when user do something for groups
  socket.on(ESocketGroupEvents.GROUP_JOINED, (data) => {
    console.log("user joined");
    socket.join(data.room);
  });

  socket.on(ESocketGroupEvents.GROUP_LEFT, (data) => {
    console.log("user left");
    socket.leave(data.room);
  });

  // when a user sends a message
  socket.on(ESocketMessageEvents.MESSAGE, (data) => {
    console.log("message received");
    socket.broadcast.to(data.room).emit(ESocketMessageEvents.MESSAGE, data);
  });

  socket.on(ESocketMessageEvents.TYPING, (data) => {
    console.log("user is typing");
    socket.broadcast.to(data.room).emit(ESocketMessageEvents.TYPING, data);
  });

  socket.on(ESocketMessageEvents.MESSAGE_READ, (data) => {
    console.log("user is typing");
    socket.broadcast
      .to(data.room)
      .emit(ESocketMessageEvents.MESSAGE_READ, data);
  });

  socket.on(ESocketMessageEvents.NEW_MESSAGE, (data) => {
    console.log("new message received");
    socket.broadcast.to(data.room).emit(ESocketMessageEvents.NEW_MESSAGE, data);
  });

  socket.on(ESocketMessageEvents.STOP_TYPING, (data) => {
    console.log("user stopped typing");
    socket.broadcast.to(data.room).emit(ESocketMessageEvents.STOP_TYPING, data);
  });

  socket.on(ESocketConnectionEvents.DISCONNECT, () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send({
    name: "Chatify API",
    description: "Chatify backend service",
    version: "1.0.0",
  });
});

// adding errorHandler as last middleware to handle all error
// add this before app.listen
app.use(errorHandler);

server.listen(config.port, async () => {
  console.log(`Listening on http://localhost:${config.port}`);
  await connectDB();
});
