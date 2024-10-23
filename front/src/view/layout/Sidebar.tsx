import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../assets/0dev-logo.png";
import { FaDatabase, FaFileAlt, FaChartBar, FaUser, FaSignOutAlt, FaChevronDown, FaChevronRight, FaProjectDiagram } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isDataHubOpen, setIsDataHubOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDataHub = () => {
    setIsDataHubOpen(!isDataHubOpen);
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
          {/* Data Hub Toggle */}
          <button
            onClick={toggleDataHub}
            className="flex items-center text-cream opacity-75 hover:opacity-100"
          >
            <FaProjectDiagram className="mr-2" /> Data Hub
            {isDataHubOpen ? (
              <FaChevronDown className="ml-auto transition-transform duration-200" />
            ) : (
              <FaChevronRight className="ml-auto transition-transform duration-200" />
            )}
          </button>
          
          {/* Data Hub Sub-Items */}
          {isDataHubOpen && (
            <div className="pl-6 flex flex-col space-y-2 transition-all duration-300">
              <Link
                to="/data-hub/dashboard"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Dashboard
              </Link>
              <Link
                to="/data-hub/ecommerce"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                E-commerce
              </Link>
              <Link
                to="/data-hub/content-social"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Content & Social
              </Link>
              <Link
                to="/data-hub/seo-analytics"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                SEO & Analytics
              </Link>
              <Link
                to="/data-hub/crm"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                CRM
              </Link>
              <Link
                to="/data-hub/customer-engagement"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Customer Engagement
              </Link>
              <Link
                to="/data-hub/advertising-platforms"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Advertising Platforms
              </Link>
              <Link
                to="/data-hub/payments-finance"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Payments & Finance
              </Link>
              <Link
                to="/data-hub/support-ticketing"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Support & Ticketing
              </Link>
              <Link
                to="/data-hub/surveys-feedback"
                className="flex items-center text-cream opacity-75 hover:opacity-100"
              >
                Surveys & Feedback
              </Link>
            </div>
          )}
          
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
