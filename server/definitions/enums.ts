enum EUserRoles {
  User = "user",
  Admin = "admin",
}

enum ESocketConnectionEvents {
  // Connection events
  CONNECT = "connect",
  DISCONNECT = "disconnect",
}

enum ESocketAuthEvents {
  // Authentication events
  LOGIN = "login",
  LOGOUT = "logout",
}

enum ESocketMessageEvents {
  // Chat events
  MESSAGE = "message",
  TYPING = "typing",
  STOP_TYPING = "stopTyping",
  NEW_MESSAGE = "newMessage",
  MESSAGE_READ = "messageRead",
}

enum ESocketGroupEvents {
  // User events
  GROUP_JOINED = "groupJoined",
  GROUP_LEFT = "groupLeft",
}
enum ESocketErrorEvents {
  // Error event
  ERROR = "error",
}

enum ESocketUserEvents {
  ONLINE = "online",
  OFFLINE = "offline",
  DISCONNECTED = "user_disconnected",
  CONNECTED = "user_connected",
}

enum EMessageType {
  Text = "text",
  Image = "image",
  File = "file",
}

enum EUploadTypes {
  Local = "local",
  Cloudinary = "cloudinary",
}
export {
  EMessageType,
  ESocketAuthEvents,
  ESocketConnectionEvents,
  ESocketErrorEvents,
  ESocketGroupEvents,
  ESocketMessageEvents,
  ESocketUserEvents,
  EUserRoles,
  EUploadTypes,
};
