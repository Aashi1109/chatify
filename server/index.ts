import * as express from "express";
import { createServer } from "http";
import * as path from "path";

import * as dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const server = createServer(app);

const port = process.env.SERVER_PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ msg: "Hello world" });
});

// routes setup
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
// app.use("/api/chat");

// adding errorHandler as last middleware to handle all error
// add this before app.listen
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// server.listen(port, () => {
//   console.log("Server running at port: " + port);
// });
