import {Request, Response} from "express";

import config from "@config";
import {EUploadTypes} from "@definitions/enums";
import {IFileData, IUploadFileInterface} from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import CloudinaryService from "@services/CloudinaryService";
import FileDataService from "@services/FileDataService";

/**
 * Upload a file and create file data in the database.
 * @param {Request} req - The request object containing file upload data.
 * @param {Response} res - The response object.
 * @throws {ClientError} Throws an error if the file upload fails.
 */
const uploadFile = async (req: Request, res: Response) => {
  const { file, format, name, preview, size, uploadTo, userId } =
    req.body as IUploadFileInterface;
  const cloudinaryService = new CloudinaryService(config.cloudinary.folderPath);

  const result = await cloudinaryService.uploadFile(preview);

  if (!(result && result?.public_id)) {
    throw new ClientError("Error uploading file");
  }
  req.body.storageType = uploadTo;
  req.body.fileMetadata = result;
  req.body.userId = userId;
  req.body.path = result.secure_url;

  await createFileData(req, res);
};

/**
 * Create file data in the database.
 * @param {Request} req - The request object containing file data.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The response object with created file data.
 */
const createFileData = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { format, name, size, path, fileMetadata, storageType, userId } =
    req.body as IFileData;
  const fileDataSave = await FileDataService.create({
    path,
    name,
    size,
    format,
    fileMetadata,
    storageType,
    userId,
  });

  return res
    .status(201)
    .type("json")
    .send({ data: fileDataSave, success: true });
};

/**
 * Get Cloudinary file information by public ID.
 * @param {Request} req - The request object containing the file public ID.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The response object with Cloudinary file information.
 */
const getCloudinaryFileByPublicId = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  const { options } = req.body;
  const cloudinaryService = new CloudinaryService(config.cloudinary.folderPath);
  const result = await cloudinaryService.getAssetInfo(id, options ?? {});
  return res.status(200).type("json").send({ data: result, success: true });
};

/**
 * Get file data by ID.
 * @param {Request} req - The request object containing the file ID.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The response object with the file data.
 */
const getFileDataById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const fileData = await FileDataService.getById(id);
  return res.status(200).type("json").send({ data: fileData, success: true });
};

/**
 * Delete file data by ID.
 * @param {Request} req - The request object containing the file ID.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The response object with the deleted file data.
 */
const deleteFileDataById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const fileData = await FileDataService.deleteById(id);
  const isCloudinaryFile = fileData.storageType === EUploadTypes.Cloudinary;
  const isLocalFile = fileData.storageType === EUploadTypes.Local;

  if (isCloudinaryFile) {
    const cloudinaryService = new CloudinaryService(
      config.cloudinary.folderPath,
    );
    await cloudinaryService.deleteByPublicId([
      fileData?.fileMetadata?.publicId,
    ]);
  } else if (isLocalFile) {
    // TODO delete files from their local storages
    const filePath = fileData.path;
  }

  return res.status(200).type("json").send({ data: fileData, success: true });
};

/**
 * Get all file data.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} The response object with all file data.
 */
const getAllFileData = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const fileData = await FileDataService.getAll();

  return res.status(200).type("json").send({ data: fileData, success: true });
};

export {
  createFileData,
  deleteFileDataById,
  getAllFileData,
  getCloudinaryFileByPublicId,
  getFileDataById,
  uploadFile,
};
