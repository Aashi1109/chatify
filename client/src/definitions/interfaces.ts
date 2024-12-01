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
  lastMessage?: IMessage; // only for typing purpose
  lastRead?: string; // only for typing purpose
  chatsNotRead?: number;
  isTyping?: boolean;
  isGroupConversation: boolean;

  // this will be used to display info in the sidebar based on conversation type
  displayInfo?: {
    _id: string;
    name?: string;
    profileImage?: { url: string }; // TODO change to image
    isActive?: boolean; // only applicable in case of user
  };
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
  lastRead?: IMessage;
}

export interface IMessage {
  tid?: string;
  _id?: string;
  user: string;
  conversation: string;
  content: string;
  sentAt: string;
  type: EMessageType;
  category: EMessageCategory;
  isEdited?: boolean;
  stats: Record<string, IMessageStats>;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IFile {
  _id?: string;
  url: string;
  filename: string;
  publicId: string;
  fileDataId: string;
  fileMetadata?: Record<string, any>;
}

export interface IMessageStats {
  readAt?: Date | null;
  deliveredAt?: Date | null;
  meta: Record<string, any>;
}
