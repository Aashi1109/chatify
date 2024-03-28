import * as dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  apiPrefixes: {
    user: "/api/user",
    auth: "/api/auth",
    chat: "/api/chat",
  },
  dbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/chatify",
  saltRounds: 10, 
};

export default config;
