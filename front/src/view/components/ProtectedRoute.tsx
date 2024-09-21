import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until loading completes
  if (loading) {
    return <div>Loading...</div>;  // You can replace this with a spinner or loader component
  }

  // Redirect to sign-in page if not authenticated
  if (!user) {
    return (
      <Navigate
        to={`/auth/signin?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};
