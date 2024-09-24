import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmEmailRequest } from "../../../services/authService"; // Import the email confirmation request

const ConfirmEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Get token from the URL
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // for some reason, useEffect runs twice, so we need to prevent that. I know it shouldn't work like this, but it does.
  let done = false;
  useEffect(() => {
    if (done) return;
    done = true;
    const confirmEmail = async () => {
      try {
        // Send the token to the backend for verification
        await confirmEmailRequest(token!); // Call the API with the token
        setStatus("success");
      } catch (error) {
        console.error("Email confirmation failed:", error);
        setStatus("error");
      }
    };
    confirmEmail();
  }, [token]);

  const handleRedirect = () => {
    navigate("/auth/signin"); // Redirect to the login page after confirmation
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {status === "loading" && "Confirming your email..."}
          {status === "success" && "Email Confirmed!"}
          {status === "error" && "Email Confirmation Failed"}
        </h2>

        {status === "success" && (
          <p className="text-center text-gray-500 mb-6">
            Your email has been confirmed. You can now log in.
          </p>
        )}

        {status === "error" && (
          <p className="text-center text-red-500 mb-6">
            Invalid or expired token. Please try again.
          </p>
        )}

        {status === "success" && (
          <button
            onClick={handleRedirect}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
