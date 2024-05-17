import { EUploadTypes } from "@definitions/enums";
import { IFileData } from "@definitions/interfaces";
import mongoose, { Model, Schema } from "mongoose";

/**
 * Mongoose schema for FileData.
 */
const fileDataSchema = new Schema<IFileData>({
  path: { type: String, required: true },
  name: { type: String, required: true },
  format: { type: String, required: true },
  size: { type: String, required: true },
  storageType: { type: String, enum: EUploadTypes, required: true },
  userId: { type: Schema.Types.ObjectId },
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
