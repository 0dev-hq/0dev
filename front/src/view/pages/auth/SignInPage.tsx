import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { loginRequest } from "../../../services/authService";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/logo-black-bg-square.png";
import backgroundImage from "../../../assets/signup-bg1.jpg";

interface SignInPageProps {
  returnTo?: string;
}

const SignInPage: React.FC<SignInPageProps> = ({ returnTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation(
    async () => loginRequest(email, password),
    {
      onSuccess: (data) => {
        const { token } = data;
        localStorage.setItem("authToken", token);
        const decodedToken: any = jwtDecode(token);
        setUser({ id: decodedToken.id, email: decodedToken.email });
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

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google${
      returnTo ? "?returnTo=" + encodeURIComponent(returnTo) : ""
    }`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with form */}
      <div className="bg-black text-white p-10 overflow-y-scroll">
        <div className="bg-dark-purple p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
          <img src={logo} alt="Logo" className="w-36 mx-auto" />
          <h2 className="text-4xl font-bold text-center mb-6">
            Sign In to Your Account
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition duration-300"
            >
              {mutation.isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              onClick={handleGoogleSignIn}
            >
              Sign In with Google
            </button>
          </div>

          <p className="mt-6 text-center flex gap-1">
            Don't have an account?
            <Link to="/auth/signup" className="text-purple-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right background side */}
      <div
        className="flex-1 bg-black flex justify-center items-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
    </div>
  );
};

export default SignInPage;
