import * as express from "express";
import { createServer } from "http";
import * as path from "path";

import * as dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middlewares/errorHandler";
import connectDB from "./database/connectDB";
import config from "./config";

dotenv.config();

const app = express();
const server = createServer(app);

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

app.listen(port, async () => {
  console.log(`Listening on http://localhost:${port}`);
  await connectDB();
});

// server.listen(port, () => {
//   console.log("Server running at port: " + port);
// });
