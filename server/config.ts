import * as dotenv from "dotenv";

const config = {
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  apiPrefixes: {
    user: "/api/user",
    auth: "/api/auth",
    chat: "/api/chat",
  },
};

export default config;
