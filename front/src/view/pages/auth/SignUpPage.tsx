import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { signupRequest } from "../../../services/authService";

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state for success message
  const navigate = useNavigate();

  // Handle email/password sign-up
  const mutation = useMutation(
    async () => signupRequest(email, password),
    {
      onSuccess: () => {
        setSuccessMessage("Sign-up successful! Please check your email to confirm your account.");
        setError(null);
      },
      onError: (err: any) =>
        setError(err.response?.data?.message || "Sign-up failed"),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  // Handle OAuth sign-up by redirecting to backend's OAuth route
  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`; // Redirect to backend's Google OAuth route
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>

        {/* Sign-up form */}
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
            {mutation.isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {successMessage && (
          <p className="text-green-500 mt-4 text-center">{successMessage}</p>
        )}

        {/* Google OAuth */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleGoogleSignUp} // Redirect to the backend to initiate the OAuth flow
          >
            Sign Up with Google
          </button>
        </div>

        {/* Link to sign in */}
        <p className="mt-6 text-center text-gray-500">
          Already have an account?
          <Link to="/auth/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
