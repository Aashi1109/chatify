import { ObjectId } from "mongoose";
import { EUploadTypes, EUserRoles } from "./enums";

interface IUser {
  username: string;
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
  messages: ObjectId[];
  userId: ObjectId;
  receiverId: ObjectId;
  optype?: "add" | "delete";
}
interface IGroups {
  messages: ObjectId[];
  name: string;
  description: string;
  users: ObjectId[];
  creatorId: ObjectId;
  image: {
    url: string;
    filename: string;
    pubicId: string;
    fileDataId: string;
  };
}

interface IUserGroups {
  userId: ObjectId;
  groupId: ObjectId;
}
export {
  IChats,
  ICloudinaryImageUploadOptions,
  ICloudinaryResponse,
  IFileInterface,
  IGroups,
  IUserGroups,
  IUploadFileInterface,
  IUser,
};
