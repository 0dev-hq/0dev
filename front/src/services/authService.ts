import apiClient from "./apiClient";

// Login request
export const loginRequest = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};

// Logout request
export const logoutRequest = async (): Promise<void> => {
  await apiClient.get("/auth/logout");
  return;
};

// Signup request
export const signupRequest = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/signup", { email, password });
  return response.data;
};

// Email confirmation request
export const confirmEmailRequest = async (token: string) => {
  const response = await apiClient.get(`/auth/confirm-email/${token}`);
  return response.data;
};
