import {
  EConversationTypes,
  EMessageCategory,
  EMessageType,
  EUserRoles,
} from "./enums";

export interface IChipItem {
  id: number | string;
  text: string;
}

export interface IConversationInfoItem {
  conversation: IConversation;
  user?: IUser;
  lastMessage?: IMessage;
  chatNotRead?: number;
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

export interface IConversation {
  _id?: string;
  participants: string[] | IUser[];
  name?: string;
  description?: string;
  creator?: string | IUser;
  image?: IFile;
  operation?: "add" | "delete";
  lastMessage?: IMessage;
  type: EConversationTypes;
  isTyping: boolean;
  chatNotRead: number;
}

export interface IMessage {
  _id?: string;
  user: string;
  chat: string;
  content: string;
  sentAt: string;
  deliveredAt?: string;
  seenAt?: string;
  type: EMessageType;
  category: EMessageCategory;
  isEdited?: boolean;
}
export interface IFile {
  url: string;
  filename: string;
  publicId: string;
  fileDataId: string;
}
