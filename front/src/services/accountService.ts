import { apiClient } from "./apiClient";

const baseRoute = "account";

// Get account details
export const getAccountDetails = async () => {
  const response = await apiClient.get(`/${baseRoute}`);
  return response.data;
};

// Send an invite to a new member
export const inviteMember = async (email: string, role: string) => {
  const response = await apiClient.post(`/${baseRoute}/invite`, {
    email,
    role,
  });
  return response.data;
};
