import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const config = {
  port: process.env.PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  apiPrefixes: {
    user: "/api/user",
    auth: "/api/auth",
    message: "/api/messages",
    chatroom: "/api/chatrooms",
  },
  dbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/chatify",
  saltRounds: 10,
  morganLogFormat: "dev",
};

export default config;
