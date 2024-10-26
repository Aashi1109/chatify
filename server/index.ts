import * as cors from "cors";
import * as express from "express";
import * as fs from "fs";
import { createServer } from "http";
import * as morgan from "morgan";
import { Server } from "socket.io";
import * as swaggerUI from "swagger-ui-express";
import * as Yaml from "yaml";

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
} from "@definitions/enums";
import { ClientError, UnauthorizedError } from "@exceptions";
import checkJwt from "@middlewares/checkJwt";
import { errorHandler } from "@middlewares/errorHandler";
import helmet from "helmet";
import { verify } from "jsonwebtoken";
import logger from "@logger";
import { jnstringify } from "@lib/utils";
import { UserService } from "@services";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { ...config.corsOptions } });

// cors setup to allow requests from the frontend only for now
app.use(cors(config.corsOptions));

app.use(helmet());

// parse requests of content-type - application/json
app.use(express.json({ limit: config.express.fileSizeLimit }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
    limit: config.express.fileSizeLimit,
  }),
);

app.use(morgan(config.morganLogFormat));

// routes setup
app.use(config.apiPrefixes.auth, authRouter);
app.use(config.apiPrefixes.user, userRouter);
app.use(config.apiPrefixes.message, messagesRouter);
app.use(config.apiPrefixes.chats, [checkJwt], chatsRouter);
app.use(config.apiPrefixes.file, fileRouter);
app.use(config.apiPrefixes.groups, [checkJwt], groupsRouter);

// swagger docs
// load yaml file
const openapiYamlFile = fs.readFileSync(
  __dirname + "/docs/openapi.yaml",
  "utf8",
);
const swaggerDocument = Yaml.parse(openapiYamlFile);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

io.engine.use(helmet());
io.use((socket, next) => {
  const { userId, token } = socket.handshake.auth;
  logger.debug(`User ${userId}. Token ${token}`);
  let err: any = null;
  if (!userId || !token) {
    err = new ClientError(`Token and User Id are required`);
    return next(err);
  }

  // verify jwt token to validate request
  const isTokenValid = verify(token, config.jwt.secret, { complete: true });
  logger.debug(
    `Validation check for userId: ${userId} -> ${jnstringify(isTokenValid)}`,
  );
  if (!isTokenValid) {
    err = new UnauthorizedError(`Invalid token provided: ${token}`);
  }
  return next(err);
});
// when a user connects
io.on(ESocketConnectionEvents.CONNECT, async (socket) => {
  logger.info(`Connected ${socket.id}`);
  const { userId } = socket.handshake.auth;

  // make user online
  await UserService.updateUser(userId, { lastSeenAt: null, isActive: true });
  console.log(`Socket object: ${socket.data}`);
});

// do something when user do something for groups
io.on(ESocketGroupEvents.GROUP_JOINED, (data) => {
  logger.info("user joined");
});

io.on(ESocketGroupEvents.GROUP_LEFT, (data) => {
  logger.info("user left");
});

io.on(ESocketMessageEvents.TYPING, (data) => {
  logger.info("user is typing");
});

io.on(ESocketMessageEvents.NEW_MESSAGE, (data) => {
  logger.info("new message received");
});

io.on(ESocketConnectionEvents.DISCONNECT, () => {
  logger.info("user disconnected");
});

app.get("/", (req, res) => {
  res.send({
    name: "Chatify API",
    description: "Chatify backend service",
    version: "1.0.0",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Requested url not found Not found" });
});

// adding errorHandler as last middleware to handle all error
// add this before app.listen
app.use(errorHandler);

server.listen(config.port, async () => {
  logger.info(`Listening on http://localhost:${config.port}`);
  await connectDB();
});
