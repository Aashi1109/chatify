import FileData, { IFileData } from "../models/FileData";

/**
 * Service class for FileData.
 */
export class FileDataService {
  /**
   * Creates a new file data.
   * @param {object} data - The data for creating the file data.
   * @returns {Promise<IFileData>} The created file data.
   * @throws {Error} If an error occurs while creating the file data.
   */
  static async create(data: IFileData): Promise<IFileData> {
    try {
      const fileData = new FileData(data);
      await fileData.save();
      return fileData.toObject();
    } catch (error) {
      console.error("Error creating file data:", error);
      throw error;
    }
  }

  /**
   * Gets all file data.
   * @returns {Promise<IFileData[]>} The array of file data.
   * @throws {Error} If an error occurs while getting the file data.
   */
  static async getAll(): Promise<IFileData[]> {
    try {
      const fileData = await FileData.find().lean();
      return fileData;
    } catch (error) {
      console.error("Error getting file data:", error);
      throw error;
    }
  }

  /**
   * Gets file data by ID.
   * @param {string} id - The ID of the file data.
   * @returns {Promise<IFileData | null>} The file data or null if not found.
   * @throws {Error} If an error occurs while getting the file data by ID.
   */
  static async getById(id: string): Promise<IFileData | null> {
    try {
      const fileData = await FileData.findById(id).lean();
      return fileData;
    } catch (error) {
      console.error("Error getting file data by ID:", error);
      throw error;
    }
  }

  /**
   * Deletes file data by ID.
   * @param {string} id - The ID of the file data to delete.
   * @returns {Promise<IFileData | null>} The deleted file data or null if not found.
   * @throws {Error} If an error occurs while deleting the file data by ID.
   */
  static async deleteById(id: string): Promise<IFileData | null> {
    try {
      const result = await FileData.findByIdAndDelete(id).lean();
      return result;
    } catch (error) {
      console.error("Error deleting file data by ID:", error);
      throw error;
    }
  }
}

export default FileDataService;
