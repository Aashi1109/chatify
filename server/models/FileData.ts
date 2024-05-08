import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { EUploadTypes } from "../definitions/enums";

/**
 * Interface representing the FileData document.
 */
export interface IFileData {
  path: string;
  name: string;
  format: string;
  size: string;
  storageType: string;
  userId?: ObjectId;
  fileMetadata?: Record<string, any>;
}

/**
 * Mongoose schema for FileData.
 */
const fileDataSchema = new Schema<IFileData>({
  path: { type: String, required: true },
  name: { type: String, required: true },
  format: { type: String, required: true },
  size: { type: String, required: true },
  storageType: { type: String, enum: EUploadTypes, required: true },
  userId: { type: mongoose.Types.ObjectId },
  fileMetadata: { type: Schema.Types.Mixed },
});

/**
 * Model representing FileData.
 */
const FileData: Model<IFileData> = mongoose.model<IFileData>(
  "FileData",
  fileDataSchema
);

export default FileData;
