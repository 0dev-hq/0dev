import { Request, Response } from "express";
import StorageProviderFactory from "../services/storage-provider/storage-provider-factory";
import { StorageProviderType } from "../services/storage-provider/storage-provider";
// import * as multer from "multer";
import { DataPipelineType } from "../services/data-pipeline/data-pipeline";
import { DataPipelineFactory } from "../services/data-pipeline/data-pipeline-factory";
import DataSource, { DataSourceType } from "../models/data-source";

const storageProvider = StorageProviderFactory.getStorageProvider(
  process.env.DEFAULT_STORAGE_PROVIDER as StorageProviderType
);

const dataPipeline = DataPipelineFactory.getDataPipeline(
  process.env.DATA_PIPELINE_TYPE as DataPipelineType
);

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const storageController = {
  async listFiles(req: Request, res: Response) {
    try {
      const files = await storageProvider.listFiles(req.user!.account!);
      res.status(200).json(files);
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  },

  async uploadFile(req: MulterRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file as Express.Multer.File;
      const uploadResult = await storageProvider.uploadFile(
        req.user!.account!,
        file
      );

      if (uploadResult) {
        res.status(201).json({ message: "File uploaded successfully" });
      } else {
        res.status(500).json({ error: "Failed to upload file" });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  },

  async deleteFile(req: Request, res: Response) {
    try {
      const { file: fileUrl } = req.params;

      if (!fileUrl) {
        return res.status(400).json({ error: "File URL is required" });
      }

      const deleteResult = await storageProvider.deleteFile(
        req.user!.account!,
        fileUrl
      );

      if (deleteResult) {
        res.status(200).json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete file" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  },

  async downloadFile(req: Request, res: Response) {
    try {
      const { file: fileUrl } = req.params;
      const file = await storageProvider.downloadFile(
        req.user!.account!,
        fileUrl
      );
      res.status(200).send(file);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  },

  async ingest(req: Request, res: Response) {
    const { file: fileUrl } = req.params;

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    try {
      const ingestResult = await dataPipeline.ingestDataObject(
        `${req.user!.account}/${fileUrl}`
      );

      console.log("ingestResult", ingestResult);

      if (ingestResult) {
        const fileExtension = fileUrl.split(".").pop();
        const dataSourceType = {
          csv: DataSourceType.IMPORTED_CSV,
          xlsx: DataSourceType.IMPORTED_EXCEL,
          pdf: DataSourceType.IMPORTED_PDF,
          docx: DataSourceType.IMPORTED_WORD,
        }[fileExtension!];
        console.log("dataSourceType", dataSourceType);
        const newDataSource = new DataSource({
          type: dataSourceType,
          name: fileUrl.replace(".", "-"),
          ingestionInfo: {
            fileName: fileUrl,
            tableNames: ingestResult,
            ingestionTime: new Date(),
          },
          createdBy: req.user!.id,
          owner: req.user!.account,
        });
        await newDataSource.save();
        res.status(200).json({ message: "File ingested successfully" });
      } else {
        res.status(500).json({ error: "Failed to ingest file" });
      }
    } catch (error) {
      console.error("Error ingesting file:", error);
      res.status(500).json({ error: "Failed to ingest file" });
    }
  },
};
