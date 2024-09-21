import { Query } from "../models/Query";
import { apiClient } from "./apiClient";

// Fetch all queries
export const getQueries = async () => {
  const response = await apiClient.get<Query[]>("query");
  return response.data;
};

// Fetch a query by ID
export const getQueryById = async (id: string) => {
  const response = await apiClient.get<Query>(`query/${id}`);
  return response.data;
};

// Fetch queries by data source
export const getQueriesByDataSource = async (dataSourceId: string) => {
  const response = await apiClient.get(`query/data-source/${dataSourceId}`);
  return response.data;
};

// Create a new query
export const createQuery = async (data: Query) => {
  const response = await apiClient.post("query", data);
  return response.data;
};

// Update a query
export const updateQuery = async (data: Query) => {
  const response = await apiClient.put(`query/${data._id}`, data);
  return response.data;
};

// Delete a query
export const deleteQuery = async (id: string) => {
  const response = await apiClient.delete(`query/${id}`);
  return response.data;
};

// Execute a query with pagination
export const executeQuery = async (
  queryId: string,
  page: number = 1,
  pageSize: number = 50
) => {
  const response = await apiClient.post(
    `query/execute/${queryId}?page=${page}&pageSize=${pageSize}`
  );
  return response.data?.data;
};

// Rebuild a query
export const rebuildQuery = async (queryId: string) => {
  await apiClient.post(`query/build/${queryId}`);
};
