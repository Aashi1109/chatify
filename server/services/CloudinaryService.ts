import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import {
  ICloudinaryImageUploadOptions,
  ICloudinaryResponse,
} from "../definitions/interfaces";
/**
 * CloudinaryService class for handling file uploads and asset information retrieval using Cloudinary API.
 */
class CloudinaryService {
  #options: ICloudinaryImageUploadOptions;

  /**
   * Constructs a new instance of CloudinaryService.
   */
  constructor(folderPath: string) {
    cloudinary.config({
      api_key: config.cloudinary.apiKey,
      cloud_name: config.cloudinary.cloudName,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });

    this.#options = {
      user_filename: false,
      unique_filename: true,
      overwrite: false,
      resource_type: "auto",
      folder: folderPath,
    };
  }

  /**
   * Sets the upload options for the CloudinaryService instance.
   *
   * @param {ICloudinaryImageUploadOptions} options - The options to be set for uploading files.
   */
  setUploadOptions(options: ICloudinaryImageUploadOptions): void {
    this.#options = { ...this.#options, ...options };
  }

  /**
   * Uploads a file to Cloudinary.
   *
   * @param {string} fileData - The fileData to the file to be uploaded.
   * @returns {Promise<ICloudinaryResponse>} - The uploaded file information.
   * @throws {Error} - If an error occurs while uploading the file.
   */
  async uploadFile(fileData: string | any): Promise<ICloudinaryResponse> {
    try {
      const result = await cloudinary.uploader.upload(fileData, this.#options);
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Fetches information about an asset in Cloudinary.
   *
   * @param {string} publicId - The unique identifier of the asset in Cloudinary.
   * @param {object} [options] - Additional options to pass to the Cloudinary API.
   * @returns {Promise<object>} - The information about the asset.
   * @throws {Error} - If an error occurs while fetching the asset info.
   */
  async getAssetInfo(publicId: string, options: object = {}): Promise<object> {
    try {
      const result = await cloudinary.api.resource(publicId, options);
      return result;
    } catch (error) {
      console.error("Error fetching asset info:", error);
      throw error;
    }
  }

  async deleteByPublicId(
    publicIds: string[],
    options: object = {}
  ): Promise<object | any> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds, options);
      return result;
    } catch (error) {
      console.error("Error deleting assets error:", error);
      throw error;
    }
  }
}

export default CloudinaryService;
