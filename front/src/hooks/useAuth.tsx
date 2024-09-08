import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { loginRequest, logoutRequest } from "../services/authService";
import { User } from "../types";
import {jwtDecode} from "jwt-decode";

// Define a type for the AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;  // Store JWT token
  login: (email: string, password: string, returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;  // Add setUser here
}

// Create the context with the defined type or null initially
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Store JWT token
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load the JWT from localStorage (if exists) on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode<{id: string, email: string}>(storedToken);
      setUser({ id: decodedToken.id, email: decodedToken.email });
    }
  }, []);

  const loginMutation = useMutation(
    async ({ email, password, returnTo }: { email: string; password: string; returnTo?: string }) => {
      return loginRequest(email, password); // Ensure loginRequest handles only email/password
    },
    {
      onSuccess: (data, variables) => {
        const { token, user } = data;
        const { returnTo } = variables; // Now, this will be recognized
  
        setToken(token); // Store JWT token
        setUser(user); // Set the user data
        localStorage.setItem("authToken", token); // Save token to localStorage
        queryClient.setQueryData("user", user);
  
        // Redirect to returnTo or default to /data-sources
        navigate(returnTo || "/data-sources");
      },
      onError: (error) => {
        console.error("Login failed:", error);
      },
    }
  );

  const logoutMutation = useMutation(
    async () => {
      return logoutRequest();
    },
    {
      onSuccess: () => {
        setToken(null); // Clear JWT token
        setUser(null);
        localStorage.removeItem("authToken"); // Remove token from localStorage
        queryClient.removeQueries("user");
        navigate("/auth/signin");
      },
      onError: (error) => {
        console.error("Logout failed:", error);
      },
    }
  );

  const login = async (email: string, password: string, returnTo?: string) => {
    return loginMutation.mutateAsync({ email, password, returnTo });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
