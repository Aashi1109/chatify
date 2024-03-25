import * as express from "express";
import { createServer } from "http";
import * as path from "path";

import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

const port = process.env.SERVER_PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api", (req, res) => {
  res.json({ msg: "Hello world" });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

server.listen(port, () => {
  console.log("Server running at port: " + port);
});
