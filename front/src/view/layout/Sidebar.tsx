import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../assets/0dev-logo.png";

const Sidebar: React.FC = () => {
  const { logout } = useAuth(); // Get the logout function from auth context

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function
    } catch (error) {
      console.error("Logout failed", error); // Handle errors
    }
  };

  return (
    <div className="w-64 flex flex-col justify-between bg-black text-white">
      {/* Logo - background black - image at center */}
      <div className=" px-6 flex items-center justify-start h-20 bg-black">
        <img src={Logo} alt="Logo" className="w-12" />
      </div>

      <div className="flex-grow px-6">
        {/* Links */}
        <nav className="flex flex-col space-y-4">
          <Link
            to="/data-source"
            className="text-cream opacity-75 hover:opacity-100"
          >
            Data Source
          </Link>
          <Link to="/query" className="text-cream opacity-75 hover:opacity-100">
            Queries
          </Link>
          <Link
            to="/report"
            className="text-cream opacity-75 hover:opacity-100"
          >
            Reports
          </Link>
        </nav>
      </div>
      {/* Footer Links */}
      <div className="flex flex-col p-6 border-t-2">
        <Link to="/account" className="text-cream opacity-75 hover:opacity-100">
          Account
        </Link>
        <Link
          to="https://discord.gg/GNSCWZm6kT"
          target="_blank"
          className="text-cream opacity-75 hover:opacity-100 mt-4"
        >
          <i className="fab fa-discord"></i>
          Help
        </Link>
        {/* Logout Link (Styled like other links) */}
        <button
          onClick={handleLogout}
          className="text-left text-cream opacity-75 hover:opacity-100 mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
