import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const config = {
  port: process.env.PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "30d",
  },
  apiPrefixes: {
    user: "/api/user",
    auth: "/api/auth",
    message: "/api/messages",
    userchats: "/api/userchats",
    file: "/api/file",
    chats: "/api/chats",
    groups: "/api/groups",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    folderPath: "ChatifyAPI",
  },
  dbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/chatify",
  saltRounds: 10,
  morganLogFormat: "dev",
  express: {
    fileSizeLimit: "20mb",
  },
  corsOptions: { origin: ["http://localhost:3000"], optionsSuccessStatus: 200 },
};

export default config;
