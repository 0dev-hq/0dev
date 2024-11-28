export enum StorageProviderType {
  LOCAL = "local",
  S3 = "s3",
}

export interface StorageFile {
  type: string;
  url: string;
  size: number;
  createdAt: Date;
}

export interface StorageProvider {
  listFiles(subPath: string): Promise<StorageFile[]>;
  uploadFile(subPath: string, file: Express.Multer.File): Promise<boolean>;
  deleteFile(subPath: string, fileUrl: string): Promise<boolean>;
  downloadFile(subPath: string, fileUrl: string): Promise<Buffer>;
}
