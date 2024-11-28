import { apiClient } from "./apiClient";
export interface StorageFile {
  type: string;
  url: string;
  size: number;
  createdAt: Date;
}

const baseRoute = "file";

export const fileService = {
  async listFiles(): Promise<StorageFile[]> {
    try {
      const response = await apiClient.get<StorageFile[]>(`/${baseRoute}`);
      return response.data;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },

  async uploadFile(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiClient.post(`/${baseRoute}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 100000,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await apiClient.delete(`/${baseRoute}/${fileUrl}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  async downloadFile(fileUrl: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/${baseRoute}/download/${fileUrl}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
};
