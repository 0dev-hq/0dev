import { authClient } from "./apiClient";

// Login request
export const loginRequest = async (email: string, password: string) => {
  const response = await authClient.post("/login", { email, password });
  return response.data;
};

// Logout request
export const logoutRequest = async (): Promise<void> => {
  await authClient.get("/logout");
  return;
};

// Signup request
export const signupRequest = async (email: string, password: string) => {
  const response = await authClient.post("/signup", { email, password });
  return response.data;
};

// Email confirmation request
export const confirmEmailRequest = async (token: string) => {
  const response = await authClient.get(`/confirm-email/${token}`);
  return response.data;
};

// Accept an invitation
export const acceptInvitation = async (token: string, password: string) => {
  const response = await authClient.post(`/accept-invite/${token}`, {
    password,
  });
  return response.data;
};
