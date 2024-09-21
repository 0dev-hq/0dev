import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { loginRequest } from "../../../services/authService";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../../hooks/useAuth";

interface SignInPageProps {
  returnTo?: string;
}

const SignInPage: React.FC<SignInPageProps> = ({ returnTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Handle email/password login
  const mutation = useMutation(
    async () => loginRequest(email, password), // Handle login request
    {
      onSuccess: (data) => {
        const { token } = data; // Get the token and return URL from backend response
        localStorage.setItem("authToken", token); // Store the token in localStorage
        
        // Decode the JWT token to get user details and update context
        const decodedToken: any = jwtDecode(token);
        setUser({ id: decodedToken.id, email: decodedToken.email }); // Update the user in context
        
        const searchParams = new URLSearchParams(window.location.search);
        const returnTo = searchParams.get("returnTo") || "/data-source";
        navigate(returnTo);
        
      },
      onError: (err) => setError("Login failed"),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  // Handle Google Sign In by redirecting to backend's Google OAuth route
  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google${
      returnTo ? "?returnTo=" + encodeURIComponent(returnTo) : ""
    }`; // Redirect to the backend's Google OAuth route
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign In to Your Account
        </h2>

        {/* Login form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {mutation.isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Google OAuth */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleGoogleSignIn} // Redirect to the backend to initiate the OAuth flow
          >
            Sign In with Google
          </button>
        </div>

        <p className="mt-6 text-center text-gray-500">
          Don't have an account?
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
