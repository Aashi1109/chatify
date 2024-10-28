import { Types } from "mongoose";
import { EMessageType, EUploadTypes } from "./enums";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

interface IUser {
  _id?: string;
  username: string;
  name: string;
  profileImage: {
    url: string;
    filename: string;
    pubicId: string;
    fileDataId: string;
  };
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

interface IChats {
  messages: Types.ObjectId[];
  participants: Types.ObjectId[];
  optype?: "add" | "delete";
}

interface IGroups {
  messages: Types.ObjectId[];
  name: string;
  description: string;
  creatorId: Types.ObjectId;
  image: {
    url: string;
    filename: string;
    pubicId: string;
    fileDataId: string;
  };
}

interface IUserGroups {
  userId: Types.ObjectId;
  groupId: Types.ObjectId;
}

interface IMessage {
  userId: Types.ObjectId | string;
  chatId: Types.ObjectId;
  content: string;
  sentAt?: Date;
  deliveredAt?: Date;
  seenAt?: Date;
  groupId?: Types.ObjectId;
  type: EMessageType;
  isEdited?: boolean;
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
}

export interface IRequestPagination extends Request {
  pagination: IPagination;
}

export interface IObjectKeys {
  [key: string]: any;
}

export {
  IChats,
  IUserRequest,
  ICloudinaryImageUploadOptions,
  ICloudinaryResponse,
  IFileData,
  IFileInterface,
  IGroups,
  IMessage,
  IUploadFileInterface,
  IUser,
  IUserGroups,
};
