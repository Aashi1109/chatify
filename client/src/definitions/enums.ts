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
