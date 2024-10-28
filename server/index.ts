import { createServer } from "http";

import connectDB from "@database/connectDB";
import logger from "@logger";
import { initializeSocket } from "./socket";
import app from "@app";
import config from "@config";

const server = createServer(app);
initializeSocket(server);

server.listen(config.port, async () => {
  logger.info(`Listening on http://localhost:${config.port}`);
  await connectDB();
});
