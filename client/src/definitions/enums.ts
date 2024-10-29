export enum ChatDeliveryStatus {
  Sending,
  Sent,
  Delivered,
  DeliveredRead,
  Failed,
}
export enum EUserRoles {
  User = "user",
  Admin = "admin",
}

export enum EToastType {
  Success,
  Error,
  Warning,
  Info,
}

export enum EMessageType {
  Text = "text",
  Image = "image",
  File = "file",
}

export enum ESocketMessageEvents {
  // Chat events
  TYPING = "message:typing",
  NEW_MESSAGE = "message:create",
  MESSAGE_UPDATE = "message:update",
  MESSAGE_DELETE = "message:delete",
}

export enum EConversationEvents {
  JoinConversation = "conversation:join",
  LeaveConversation = "conversation:leave",
}
