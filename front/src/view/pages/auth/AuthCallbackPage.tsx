import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../../context/AuthProvider";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    let returnTo = urlParams.get("returnTo") || "/data-sources"; // Default to /data-sources

    // Extract only the path if returnTo is a full URL
    if (returnTo.startsWith("http")) {
      try {
        const parsedUrl = new URL(returnTo);
        returnTo = parsedUrl.pathname + parsedUrl.search; // Extract path and query string
      } catch (error) {
        console.error("Failed to parse returnTo URL:", error);
      }
    }
    console.log(`AuthCallback returnTo: ${returnTo}`);
    console.log(`AuthCallback token: ${token}`);
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem("authToken", token);
      
      // Decode the token to get user info and update context
      const decodedToken: any = jwtDecode(token);
      console.log(`AuthCallback decodedToken.id: ${decodedToken.id} - navigating to ${returnTo}`);
      setUser({ id: decodedToken.id, email: decodedToken.email });

      // Redirect to the original page (or fallback)
      setTimeout(() => navigate(returnTo), 500); // without the delay it doesn't work. It goes back to the login page
    } else {
      // If no token, redirect to login
      navigate("/auth/signin");
    }
  }, [navigate, setUser]);

  return <div>Redirecting...</div>;
};

export default AuthCallback;
