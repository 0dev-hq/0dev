import { apiClient } from "./apiClient";

const baseRoute = "account";

// Get account details
export const getAccountDetails = async () => {
  const response = await apiClient.get(`/${baseRoute}`);
  return response.data;
};
