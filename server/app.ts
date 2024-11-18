import cors from "cors";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import swaggerUI from "swagger-ui-express";
import Yaml from "yaml";
import cookieparser from "cookie-parser";

import config from "@config";
import authRouter from "@routes/auth.routes";
import chatsRouter from "@routes/conversation.routes";
import fileRouter from "@routes/file.routes";
import userRouter from "@routes/user.routes";

import userParser from "@middlewares/userParser";
import { errorHandler } from "@middlewares/errorHandler";
import helmet from "helmet";

const app = express();

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
  })
);

app.use(morgan(config.morganLogFormat));
app.use(cookieparser());

// routes setup
app.use(config.apiPrefixes.auth, authRouter);
app.use(config.apiPrefixes.user, userRouter);
app.use(config.apiPrefixes.conversation, [userParser], chatsRouter);
app.use(config.apiPrefixes.file, fileRouter);

// swagger docs
// load yaml file
const openapiYamlFile = fs.readFileSync(
  __dirname + "/docs/openapi.yaml",
  "utf8"
);
const swaggerDocument = Yaml.parse(openapiYamlFile);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

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
app.use(errorHandler);

export default app;
