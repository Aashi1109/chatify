import * as express from "express";
import { createServer } from "http";
import * as path from "path";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middlewares/errorHandler";
import connectDB from "./database/connectDB";
import config from "./config";
import { Server } from "socket.io";
import { ESocketEvents } from "./definitions/enums";

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.SERVER_PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// routes setup
app.use(config.apiPrefixes.auth, authRouter);
app.use(config.apiPrefixes.user, userRouter);
// app.use("/api/chat");

// adding errorHandler as last middleware to handle all error
// add this before app.listen
app.use(errorHandler);

// when a user connects
io.on(ESocketEvents.CONNECT, (socket) => {
  // do something on connection
  socket.on(ESocketEvents.ROOM_JOINED, (data) => {
    console.log("user joined");
    socket.join(data.room);
  });

  socket.on(ESocketEvents.ROOM_LEFT, (data) => {
    console.log("user left");
    socket.leave(data.room);
  });

  // when a user sends a message
  socket.on(ESocketEvents.MESSAGE, (data) => {
    console.log("message received");
    socket.broadcast.to(data.room).emit(ESocketEvents.MESSAGE, data);
  });

  socket.on(ESocketEvents.TYPING, (data) => {
    console.log("user is typing");
    socket.broadcast.to(data.room).emit(ESocketEvents.TYPING, data);
  });

  socket.on(ESocketEvents.MESSAGE_READ, (data) => {
    console.log("user is typing");
    socket.broadcast.to(data.room).emit(ESocketEvents.MESSAGE_READ, data);
  });

  socket.on(ESocketEvents.NEW_MESSAGE, (data) => {
    console.log("new message received");
    socket.broadcast.to(data.room).emit(ESocketEvents.NEW_MESSAGE, data);
  });

  socket.on(ESocketEvents.STOP_TYPING, (data) => {
    console.log("user stopped typing");
    socket.broadcast.to(data.room).emit(ESocketEvents.STOP_TYPING, data);
  });

  socket.on(ESocketEvents.DISCONNECT, () => {
    console.log("user disconnected");
  });
});

app.listen(port, async () => {
  console.log(`Listening on http://localhost:${port}`);
  await connectDB();
});

// server.listen(port, () => {
//   console.log("Server running at port: " + port);
// });
