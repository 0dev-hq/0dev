import { Report } from "../models/Report";
import { apiClient } from "./apiClient";

const baseRoute = "report";

// Save or update a report
export const saveReport = async (report: Report): Promise<Report> => {
  if (report._id) {
    // Update existing report
    const response = await apiClient.put(`/${baseRoute}/${report._id}`, report);
    return response.data;
  } else {
    // Create new report
    const response = await apiClient.post(`/${baseRoute}`, report);
    return response.data;
  }
};

// Get a specific report by ID
export const getReport = async (reportId: string): Promise<Report> => {
  const response = await apiClient.get(`/${baseRoute}/${reportId}`);
  return response.data;
};

// Get all reports (just IDs and names)
export const getReports = async (): Promise<
  { _id: string; name: string }[]
> => {
  const response = await apiClient.get(`/${baseRoute}`);
  return response.data; // List of reports with only id and name
};

// Delete a report by ID
export const deleteReport = async (reportId: string): Promise<void> => {
  await apiClient.delete(`/${baseRoute}/${reportId}`);
};

// Analyze a block group
export const analyzeBlockGroup = async (
  reportId: string,
  blockGroupIndex: number,
  data: any,
  queryId: string
): Promise<void> => {
  await apiClient.post(`/${baseRoute}/${reportId}/analyze/${blockGroupIndex}`, {
    data,
    queryId,
  });
};
