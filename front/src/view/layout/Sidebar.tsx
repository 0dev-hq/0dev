import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../assets/0dev-logo.png";
import { FaDatabase, FaFileAlt, FaChartBar, FaUser, FaSignOutAlt, FaRobot } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };


  return (
    <div className="w-64 flex flex-col justify-between bg-black text-white h-screen">
      {/* Logo */}
      <div className="px-6 flex items-center justify-start h-20 bg-black">
        <img src={Logo} alt="Logo" className="w-12" />
      </div>

      <div className="flex-grow px-6">
        {/* Links */}
        <nav className="flex flex-col space-y-4">
          
          {/* Existing Top-Level Links */}
          <Link
            to="/data-source"
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaDatabase className="mr-2" /> Data Source
          </Link>
          <Link
            to="/query"
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaFileAlt className="mr-2" /> Queries
          </Link>
          <Link
            to="/report"
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaChartBar className="mr-2" /> Reports
          </Link>
          <Link
            to="/file"
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaFileAlt className="mr-2" /> Files
          </Link>
          {/* Agents */}
          <Link
            to="/agent"
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaRobot className="mr-2" /> Agents
          </Link>
        </nav>
      </div>

      {/* Footer Links */}
      <div className="flex flex-col p-6 border-t-2">
        <Link
          to="/account"
          className="flex items-center text-cream opacity-75 hover:opacity-100"
        >
          <FaUser className="mr-2" /> Account
        </Link>
        <Link
          to="https://discord.gg/GNSCWZm6kT"
          target="_blank"
          className="flex items-center text-cream opacity-75 hover:opacity-100 mt-4"
        >
          <FaDiscord className="mr-2" /> Help
        </Link>
        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="flex items-center text-left text-cream opacity-75 hover:opacity-100 mt-4"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
