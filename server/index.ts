import * as express from "express";
import { createServer } from "http";
import * as path from "path";
import * as morgan from "morgan";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import messagesRouter from "./routes/messages.routes";
import chatroomRouter from "./routes/chatroom.routes";

import { errorHandler } from "./middlewares/errorHandler";
import connectDB from "./database/connectDB";
import config from "./config";

const app = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname, "public")));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan(config.morganLogFormat));

// routes setup
app.use(config.apiPrefixes.auth, authRouter);
app.use(config.apiPrefixes.user, userRouter);
app.use(config.apiPrefixes.chatroom, chatroomRouter);
app.use(config.apiPrefixes.message, messagesRouter);
// app.use("/api/chat");

// adding errorHandler as last middleware to handle all error
// add this before app.listen
app.use(errorHandler);

app.listen(config.port, async () => {
  console.log(`Listening on http://localhost:${config.port}`);
  await connectDB();
});
