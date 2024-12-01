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
  UPDATE = "message:update",
  MESSAGE_DELETE = "message:delete",
}

enum ESocketErrorEvents {
  // Error event
  ERROR = "error",
}

enum ESocketUserEvents {
  UPDATES = "user:updates",
  DELETE = "user:delete",
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
  Update = "conversation:update",
  CurrentChatWindow = "conversation:currentChatWindow",
}

export enum EConversationTypes {
  PRIVATE = "private",
  GROUP = "group",
  ARCHIVED = "archived",
}

export {
  EMessageType,
  ESocketAuthEvents,
  ESocketConnectionEvents,
  ESocketErrorEvents,
  ESocketMessageEvents,
  ESocketUserEvents,
  EUserRoles,
  EUploadTypes,
};
