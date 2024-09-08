import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to sign-in page, pass current URL in returnTo
    return (
      <Navigate 
        to={`/auth/signin?returnTo=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  return children;
};