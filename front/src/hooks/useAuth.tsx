import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { loginRequest, logoutRequest } from "../services/authService";
import { User } from "../types";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;  // Add loading state to the context
  login: (email: string, password: string, returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);  // Initialize loading to true
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isTokenExpired = (token: string) => {
    const decoded: JwtPayload = jwtDecode(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return true; // Token has expired
    }
    return false;
  };

  // Load JWT from localStorage and decode it
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      const decodedToken = jwtDecode<{ id: string; email: string }>(storedToken);
      setUser({ id: decodedToken.id, email: decodedToken.email });
    } else {
      // If token is expired or not present, clear it from local storage
      localStorage.removeItem("authToken");
      setUser(null);
    }
    setLoading(false); // Mark loading as complete
  }, []);

  const loginMutation = useMutation(
    async ({ email, password }: { email: string; password: string; returnTo?: string }) => {
      return loginRequest(email, password);
    },
    {
      onSuccess: (data, variables) => {
        const { token, user } = data;
        const { returnTo } = variables;

        setToken(token);
        setUser(user);
        localStorage.setItem("authToken", token);
        queryClient.setQueryData("user", user);

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
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
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
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
