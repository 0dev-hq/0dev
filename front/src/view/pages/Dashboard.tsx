import React from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-red-500">
          Welcome to the LandingAI Dashboard!
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Build AI-powered landing pages with ease.
        </p>
      </div>
    </>
  );
};

export default Dashboard;
