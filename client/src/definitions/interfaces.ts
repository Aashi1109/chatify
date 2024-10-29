import { EMessageType, EUserRoles } from "./enums";

export interface IChipItem {
  id: number | string;
  text: string;
}

export interface IChatInfoItem {
  conversation: IChat | IGroups;
  user?: IUser;
  lastChatTime?: Date;
  lastChatText: string;
  isUserActive: boolean;
  chatsNotRead: number;
}

export interface IFileInterface {
  file?: File;
  preview: string | File;
  name: string;
  format: string;
  size: string;
}

export interface IUser {
  _id?: string;
  username: string;
  name: string;
  password?: string;
  about?: string;
  profileImage: {
    url: string;
  };
  createdAt: Date;
  role: EUserRoles;
  isActive: boolean;
  lastSeenAt: Date;
}

export interface IChat {
  _id: string;
  messages: IMessage[] | string[];
  participants: IUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id?: string;
  userId: string;
  chatId: string;
  content: string;
  sentAt: string;
  deliveredAt?: string;
  seenAt?: string;
  groupId?: string;
  type: EMessageType;
  isEdited?: boolean;
}

export interface IGroups {
  _id?: string;
  messages?: string[];
  name: string;
  description: string;
  creatorId: string;
  image: {
    url: string;
    filename: string;
    publicId: string;
    fileDataId: string;
  };
  users?: string[];
}

export enum ESocketMessageEvents {
  // Chat events
  TYPING = "message:typing",
  NEW_MESSAGE = "message:create",
  MESSAGE_UPDATE = "message:update",
  MESSAGE_DELETE = "message:delete",
}
