// services/dataHubService.ts
import { apiClient } from "./apiClient";
import { DataHub } from "../models/DataHub";

// Add a new data hub
export const addDataHub = async (data: DataHub) => {
  const response = await apiClient.post("/data-hub", data);
  return response.data;
};

// Fetch data hub by ID
export const getDataHubById = async (id: string) => {
  const response = await apiClient.get(`/data-hub/${id}`);
  return response.data;
};

// Update an existing data hub
export const updateDataHub = async (data: DataHub) => {
  const response = await apiClient.put(`/data-hub/${data.id}`, data);
  return response.data;
};

// Fetch all data hubs
export const getDataHubs = async () => {
  const response = await apiClient.get("/data-hub");
  return response.data;
};

// Delete a data hub
export const deleteDataHub = async (id: string) => {
  const response = await apiClient.delete(`/data-hub/${id}`);
  return response.data;
};
