import { toast } from "react-toastify";
import { apiClient } from "./apiClient";

// File metadata interface (matches the backend `StorageFile` type)
export interface StorageFile {
  url: string;
  size: number;
  createdAt: Date;
}

const baseRoute = "file";

export const fileService = {
  /**
   * List all files in the storage
   * @returns Promise<StorageFile[]> - List of files with metadata
   */
  async listFiles(): Promise<StorageFile[]> {
    try {
      const response = await apiClient.get<StorageFile[]>(`/${baseRoute}`);
      return response.data;
    } catch (error) {
      console.error("Error listing files:", error);
      toast.error("Failed to fetch file list.");
      throw error;
    }
  },

  /**
   * Upload a file to the storage
   * @param file - File to upload
   * @returns Promise<void>
   */
  async uploadFile(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiClient.post(`/${baseRoute}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
      throw error;
    }
  },

  /**
   * Delete a file from the storage
   * @param fileUrl - File URL or identifier
   * @returns Promise<void>
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await apiClient.delete(`/${baseRoute}/${fileUrl}`);
      toast.success("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file.");
      throw error;
    }
  },

  /**
   * Download a file from the storage
   * @param fileUrl - File URL or identifier
   * @returns Promise<Blob> - The file as a Blob
   */
  async downloadFile(fileUrl: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/${baseRoute}/download/${fileUrl}`,
        {
          responseType: "blob",
        }
      );

      toast.success("File downloaded successfully.");
      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file.");
      throw error;
    }
  },
};
