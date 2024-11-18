import LocalStorageProvider from "./local-storage-provider";
import S3StorageProvider from "./s3-storage-provider";
import { StorageProvider, StorageProviderType } from "./storage-provider";

export default class StorageProviderFactory {
  static getStorageProvider(type: StorageProviderType): StorageProvider {
    switch (type) {
      case StorageProviderType.LOCAL:
        return new LocalStorageProvider(process.env.STORAGE_PATH!);
      case StorageProviderType.S3:
        return new S3StorageProvider(
          process.env.USER_FILES_S3_BUCKET!,
          process.env.AWS_REGION!
        );
      default:
        throw new Error("Unsupported storage provider type");
    }
  }
}
