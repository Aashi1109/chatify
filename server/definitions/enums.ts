enum EUserRoles {
  User = "user",
  Admin = "admin",
}

enum ESocketEvents {
  // Connection events
  CONNECT = "connect",
  DISCONNECT = "disconnect",

  // Authentication events
  LOGIN = "login",
  LOGOUT = "logout",

  // Chat events
  MESSAGE = "message",
  TYPING = "typing",
  STOP_TYPING = "stopTyping",
  NEW_MESSAGE = "newMessage",
  MESSAGE_READ = "messageRead",

  // User events
  ROOM_JOINED = "roomJoined",
  ROOM_LEFT = "roomLeft",

  // Error event
  ERROR = "error",
}

export { EUserRoles, ESocketEvents };
