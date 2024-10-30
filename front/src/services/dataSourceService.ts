import { apiClient } from "./apiClient";
import { DataSource } from "../models/DataSource";

// Add a new data source
export const addDataSource = async (data: DataSource) => {
  const response = await apiClient.post("/data-source", data);
  return response.data;
};

// Fetch all data sources
export const getDataSources = async () => {
  const response = await apiClient.get("/data-source");
  return response.data;
};

// Fetch data source by ID
export const getDataSourceById = async (id: string) => {
  const response = await apiClient.get(`/data-source/${id}`);
  return response.data;
};

// Update data source
export const updateDataSource = async (data: DataSource) => {
  const response = await apiClient.put(`/data-source/${data.id}`, data);
  return response.data;
};

// Delete a data source
export const deleteDataSource = async (id: string) => {
  const response = await apiClient.delete(`/data-source/${id}`);
  return response.data;
};

// Add a new function to test the data source connection
export const testDataSourceConnection = async (data: DataSource) => {
  const response = await apiClient.post("/data-source/test-connection", data);
  return response.data.success == true;
};

// Function to trigger schema capture
export const analyze = async (id: string) => {
  const response = await apiClient.post(`/data-source/analyze/${id}`);
  return response.data;
};

// Function to fetch schema analysis
export const getDataSourceAnalysis = async (id: string) => {
  const response = await apiClient.get<DataSource>(
    `/data-source/${id}/analysis`
  );
  return response.data;
};
