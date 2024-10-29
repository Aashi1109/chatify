import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const config = {
  port: process.env.PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "30d",
  },
  apiPrefixes: {
    user: "/api/users",
    auth: "/api/auth",
    message: "/api/messages",
    file: "/api/files",
    conversation: "/api/conversation",
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
  corsOptions: {
    origin: ["http://localhost:3000", "https://editor.swagger.io"],
    optionsSuccessStatus: 200,
  },
  log: {
    filename: "chatify_server.log",
    level: "debug", // provide in lowercase. Possible values 'info', 'debug', 'warning', 'error'
    path: "./logs/",
  },
};

export default config;
