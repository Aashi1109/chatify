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
  LOGIN = "auth:login",
  LOGOUT = "auth:logout",
}

enum ESocketMessageEvents {
  // Chat events
  TYPING = "message:typing",
  NEW_MESSAGE = "message:create",
  MESSAGE_UPDATE = "message:update",
  MESSAGE_DELETE = "message:delete",
}

enum ESocketGroupEvents {
  // User events
  GROUP_JOINED = "group:join",
  GROUP_LEFT = "group:left",
  GROUP_NEW = "group:new",
  GROUP_UPDATE = "group:update",
  GROUP_DELETE = "group:delete",
}
enum ESocketErrorEvents {
  // Error event
  ERROR = "error",
}

enum ESocketUserEvents {
  ONLINE = "user:online",
  OFFLINE = "user:offline",
}

enum EMessageType {
  Text = "text",
  Image = "image",
  File = "file",
}

export enum EMessageCategory {
  System = "system",
  User = "user",
}

enum EUploadTypes {
  Local = "local",
  Cloudinary = "cloudinary",
}

export enum EConversationEvents {
  JoinConversation = "conversation:join",
  LeaveConversation = "conversation:leave",
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
