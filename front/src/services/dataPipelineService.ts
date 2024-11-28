import { apiClient } from "./apiClient";

const baseRoute = "file";

export const dataPipelineService = {
  async ingest(fileUrl: string): Promise<boolean> {
    try {
      const response = await apiClient.post(
        `/${baseRoute}/ingest/${fileUrl}`,
        {},
        { timeout: 180000 }
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
};
