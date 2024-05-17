import { EMessageType, EUserRoles } from "./enums";

export interface ChipItemI {
  id: number | string;
  text: string;
}

export interface ChatInfoItemI {
  id: string;
  imageUrl: string;
  userName: string;
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
    filename: string;
    publicId?: string;
    fileDataId?: string;
  };
  createdAt: Date;
  role: EUserRoles;
  isActive: boolean;
  lastSeenAt: Date;
}

export interface IChat {
  _id: string;
  messageId: IMessage[] | string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserChat {
  _id: string;
  userId: string | IUser;
  receiverId: string | IUser;
  chatId: string | IChat;
}

export interface IMessage {
  userId: string;
  chatId: string;
  content: string;
  sentAt: Date;
  deliveredAt?: Date;
  seenAt?: Date;
  groupId?: string;
  type: EMessageType;
  isEdited?: boolean;
}

export interface IGroups {
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
