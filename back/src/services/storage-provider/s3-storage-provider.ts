import AWS from "aws-sdk";
import { StorageFile, StorageProvider } from "./storage-provider";

export default class S3StorageProvider implements StorageProvider {
  private s3: AWS.S3;
  private bucket: string;

  constructor(bucket: string, region: string) {
    this.s3 = new AWS.S3({ region });
    this.bucket = bucket;
  }

  async listFiles(subPath: string): Promise<StorageFile[]> {
    try {
      const result = await this.s3
        .listObjectsV2({ Bucket: this.bucket, Prefix: subPath })
        .promise();

      if (!result.Contents) {
        return [];
      }

      const storageFiles: StorageFile[] = result.Contents.map((obj) => ({
        type: obj.Key ? obj.Key.split(".").pop() || "" : "",
        url: obj.Key ? obj.Key.replace(`${subPath}/`, "") : "",
        size: obj.Size || 0,
        createdAt: obj.LastModified || new Date(),
      }));

      return storageFiles;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  async uploadFile(
    subPath: string,
    file: Express.Multer.File
  ): Promise<boolean> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${subPath}/${file.originalname}`,
        Body: file.buffer,
      };
      await this.s3.upload(params).promise();
      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async deleteFile(subPath: string, fileUrl: string): Promise<boolean> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${subPath}/${fileUrl}`,
      };
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async downloadFile(subPath: string, fileUrl: string): Promise<Buffer> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${subPath}/${fileUrl}`,
      };
      const result = await this.s3.getObject(params).promise();
      if (result.Body && Buffer.isBuffer(result.Body)) {
        return result.Body;
      }
      throw new Error("File download failed: No data in S3 object.");
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }
}
