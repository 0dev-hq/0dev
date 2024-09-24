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

// Deactivate a user
export const deactivateUser = async (userId: string) => {
  const response = await apiClient.delete(`/${baseRoute}/user/${userId}`);
  return response.data;
};

// Activate a user
export const activateUser = async (userId: string) => {
  const response = await apiClient.put(`/${baseRoute}/user/${userId}/activate`);
  return response.data;
};

// Change user role
export const changeUserRole = async (userId: string, role: string) => {
  const response = await apiClient.put(`/${baseRoute}/user/${userId}/role`, {
    role,
  });
  return response.data;
};
