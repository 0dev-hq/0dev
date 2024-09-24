import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "react-query";
import { signupRequest, acceptInvitation } from "../../../services/authService";
import logo from "../../../assets/logo-black-bg-square.png";
import backgroundImage from "../../../assets/signup-bg1.jpg";
import { toast } from "react-toastify";

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");
  const invitationEmail = searchParams.get("email");

  const mutation = useMutation(async () => signupRequest(email, password), {
    onSuccess: () => {
      // show toast
      toast.success("Sign-up successful! Please check your email to confirm your account.");
      setError(null);
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Sign-up failed"),
  });

  const inviteMutation = useMutation(() => acceptInvitation(invitationToken!, password), {
    onSuccess: () => {
      toast.success("Invitation accepted successfully! You can now sign in.");
      setError(null);
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Failed to accept invitation"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invitationToken && invitationEmail) {
      inviteMutation.mutate();
    } else {
      mutation.mutate();
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const invitationMessage = (
    <div className="bg-purple-600 text-white p-4 rounded-lg text-center mb-6">
      Sign up with your email or Gmail to accept the invitation and join your
      team's account.
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left side with form */}
      <div className=" bg-black text-white p-10 overflow-y-scroll scrollbar-hide">
        <div className="bg-dark-purple p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
          <img src={logo} alt="Logo" className="w-36 mx-auto" />
          <h2 className="text-4xl font-bold text-center mb-6">
            {invitationToken && invitationEmail ? "Join Your Team" : "Create an Account"}
          </h2>

          {invitationToken && invitationEmail && invitationMessage}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={invitationToken != null && invitationEmail != null}
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
              {(mutation.isLoading || inviteMutation.isLoading) ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              onClick={handleGoogleSignUp}
            >
              Sign Up with Google
            </button>
          </div>

          <p className="mt-6 text-center flex gap-1">
            Already have an account?
            <Link to="/auth/signin" className="text-purple-400 hover:underline">
              Sign In
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
      >
        {/* Placeholder for the image */}
      </div>
    </div>
  );
};

export default SignUpPage;
