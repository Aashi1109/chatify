import { Types } from "mongoose";
import {
  EConversationTypes,
  EMessageCategory,
  EMessageType,
  EUploadTypes,
} from "./enums";
import { Request } from "express";

interface IUser {
  _id?: string;
  username: string;
  name: string;
  profileImage: IFile;
  about?: string;
  password: string;
  salt: string;
  role: string;
  isActive: boolean;
  lastSeenAt: Date;
}

interface ICloudinaryImageUploadOptions {
  user_filename?: boolean;
  unique_filename?: boolean;
  overwrite?: boolean;
  resource_type?: string | any;
  folder?: string;
}

interface IFileInterface {
  file: File;
  preview: string | File;
  name: string;
  format: string;
  size: string;
}

interface IUploadFileInterface extends IFileInterface {
  uploadTo: EUploadTypes;
  path?: string;
  userId?: string;
}

interface ICloudinaryResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

interface IConversation {
  participants: Types.ObjectId[];
  isGroup: boolean;
  name?: string;
  description?: string;
  creator: Types.ObjectId;
  image?: IFile;
  operation?: "add" | "delete";
  lastMessage?: Types.ObjectId;
  type: EConversationTypes;
}

interface IUserGroups {
  userId: Types.ObjectId;
  groupId: Types.ObjectId;
}

interface IMessage {
  user: Types.ObjectId | string;
  conversation: Types.ObjectId;
  content: string;
  sentAt?: Date;
  deliveredAt?: Date;
  seenAt?: Date;
  type: EMessageType;
  isEdited?: boolean;
  category: EMessageCategory;
}

interface IFile {
  url: string;
  filename: string;
  pubicId: string;
  fileDataId: string;
}

interface IFileData {
  path: string;
  name: string;
  format: string;
  size: string;
  storageType: string;
  userId?: Types.ObjectId;
  fileMetadata?: Record<string, any>;
}

interface IUserRequest extends Request {
  user: IUser;
}

export interface IPagination {
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  doPopulate?: boolean;
  populateFields?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface IRequestPagination extends Request {
  pagination: IPagination;
}

export interface IObjectKeys {
  [key: string]: any;
}

export {
  IConversation,
  IUserRequest,
  ICloudinaryImageUploadOptions,
  ICloudinaryResponse,
  IFileData,
  IFileInterface,
  IMessage,
  IUploadFileInterface,
  IUser,
  IUserGroups,
};
