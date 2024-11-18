import fs from "fs";
import path from "path";
import { StorageFile, StorageProvider } from "./storage-provider";
import logger from "../../utils/logger";

export default class LocalStorageProvider implements StorageProvider {
  private directory: string;

  constructor(directory: string) {
    this.directory = directory;

    // Ensure the directory exists
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }
  }

  async listFiles(subPath: string): Promise<StorageFile[]> {
    try {
      if (!fs.existsSync(path.join(this.directory, subPath))) {
        return [];
      }

      const files = await fs.promises.readdir(
        path.join(this.directory, subPath)
      );

      const storageFiles: StorageFile[] = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.directory, subPath, file);
          const stats = await fs.promises.stat(filePath);

          return {
            url: file,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        })
      );

      return storageFiles;
    } catch (error) {
      logger.error("Error listing files:", error);
      throw error;
    }
  }
  async uploadFile(
    subPath: string,
    file: Express.Multer.File
  ): Promise<boolean> {
    const subPathDir = path.join(this.directory, subPath);
    if (!fs.existsSync(subPathDir)) {
      fs.mkdirSync(subPathDir, { recursive: true });
    }

    const filePath = path.join(this.directory, subPath, file.originalname);
    try {
      await fs.promises.writeFile(filePath, file.buffer);
      return true;
    } catch (error) {
      logger.error("Error uploading file:", error);
      return false;
    }
  }

  async deleteFile(subPath: string, fileUrl: string): Promise<boolean> {
    const filePath = path.join(this.directory, subPath, fileUrl);
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      logger.error("Error deleting file:", error);
      throw error;
    }
  }

  async downloadFile(subPath: string, fileUrl: string): Promise<Buffer> {
    console.log("Downloading file:", fileUrl);
    const filePath = path.join(this.directory, subPath, fileUrl);
    try {
      const fileBuffer = await fs.promises.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      logger.error("Error downloading file:", error);
      throw error;
    }
  }
}
