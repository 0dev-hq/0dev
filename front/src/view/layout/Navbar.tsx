import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaChevronDown, FaChevronRight, FaProjectDiagram } from 'react-icons/fa';
import Logo from '../../assets/0dev-logo.png';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataHubOpen, setIsDataHubOpen] = useState(false); // Data Hub toggle state

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDataHub = () => {
    setIsDataHubOpen(!isDataHubOpen);
  };

  return (
    <div className="w-full bg-black text-white">
      {/* Top section with Logo, Centered Links, and Toggle Button */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-10" />
        </div>
        
        {/* Centered Links */}
        <div className="hidden md:flex space-x-4">
          {/* Data Hub Dropdown - Now the First Item */}
          <div className="relative">
            <button
              onClick={toggleDataHub}
              className="flex items-center text-cream opacity-75 hover:opacity-100"
            >
              <FaProjectDiagram className="mr-2" /> Data Hub
              {isDataHubOpen ? (
                <FaChevronDown className="ml-1 transition-transform duration-200" />
              ) : (
                <FaChevronRight className="ml-1 transition-transform duration-200" />
              )}
            </button>

            {/* Data Hub Sub-Menu */}
            {isDataHubOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg z-50">
                <Link
                  to="/data-hub/ecommerce"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  E-commerce
                </Link>
                <Link
                  to="/data-hub/content"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Content & Social
                </Link>
                <Link
                  to="/data-hub/seo"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  SEO & Analytics
                </Link>
                <Link
                  to="/data-hub/crm"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  CRM
                </Link>
                <Link
                  to="/data-hub/customer-engagement"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Customer Engagement
                </Link>
                <Link
                  to="/data-hub/advertising"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Advertising Platforms
                </Link>
                <Link
                  to="/data-hub/payments"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Payments & Finance
                </Link>
                <Link
                  to="/data-hub/support"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Support & Ticketing
                </Link>
                <Link
                  to="/data-hub/surveys"
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  Surveys & Feedback
                </Link>
              </div>
            )}
          </div>

          <Link to="/data-source" className="text-cream opacity-75 hover:opacity-100">
            Data Source
          </Link>
          <Link to="/query" className="text-cream opacity-75 hover:opacity-100">
            Queries
          </Link>
          <Link to="/report" className="text-cream opacity-75 hover:opacity-100">
            Reports
          </Link>
        </div>

        {/* Toggle Button for mobile */}
        <button onClick={toggleMenu} className="md:hidden text-cream opacity-75 hover:opacity-100">
          <FaBars size={20} />
        </button>
      </div>

      {/* Dropdown Menu for mobile view */}
      {isMenuOpen && (
        <div className="flex flex-col space-y-2 px-4 py-2 border-t border-gray-700 md:hidden">
          {/* Data Hub Toggle for Mobile */}
          <button onClick={toggleDataHub} className="flex items-center text-cream opacity-75 hover:opacity-100">
            <FaProjectDiagram className="mr-2" /> Data Hub
            {isDataHubOpen ? (
              <FaChevronDown className="ml-1 transition-transform duration-200" />
            ) : (
              <FaChevronRight className="ml-1 transition-transform duration-200" />
            )}
          </button>

          {/* Data Hub Sub-Items for Mobile */}
          {isDataHubOpen && (
            <div className="pl-4 flex flex-col space-y-2">
              <Link to="/data-hub/dashboard" className="block text-cream opacity-75 hover:opacity-100">
                Dashboard
              </Link>
              <Link to="/data-hub/ecommerce" className="block text-cream opacity-75 hover:opacity-100">
                E-commerce
              </Link>
              <Link to="/data-hub/content-social" className="block text-cream opacity-75 hover:opacity-100">
                Content & Social
              </Link>
              <Link to="/data-hub/seo-analytics" className="block text-cream opacity-75 hover:opacity-100">
                SEO & Analytics
              </Link>
              <Link to="/data-hub/crm" className="block text-cream opacity-75 hover:opacity-100">
                CRM
              </Link>
              <Link to="/data-hub/customer-engagement" className="block text-cream opacity-75 hover:opacity-100">
                Customer Engagement
              </Link>
              <Link to="/data-hub/advertising-platforms" className="block text-cream opacity-75 hover:opacity-100">
                Advertising Platforms
              </Link>
              <Link to="/data-hub/payments-finance" className="block text-cream opacity-75 hover:opacity-100">
                Payments & Finance
              </Link>
              <Link to="/data-hub/support-ticketing" className="block text-cream opacity-75 hover:opacity-100">
                Support & Ticketing
              </Link>
              <Link to="/data-hub/surveys-feedback" className="block text-cream opacity-75 hover:opacity-100">
                Surveys & Feedback
              </Link>
            </div>
          )}

          <Link to="/data-source" className="block text-cream opacity-75 hover:opacity-100">
            Data Source
          </Link>
          <Link to="/query" className="block text-cream opacity-75 hover:opacity-100">
            Queries
          </Link>
          <Link to="/report" className="block text-cream opacity-75 hover:opacity-100">
            Reports
          </Link>

          <Link to="/account" className="block text-cream opacity-75 hover:opacity-100">
            Account
          </Link>
          <Link
            to="https://discord.gg/GNSCWZm6kT"
            target="_blank"
            className="block text-cream opacity-75 hover:opacity-100"
          >
            Help
          </Link>
          <button onClick={handleLogout} className="block text-cream opacity-75 hover:opacity-100 text-left">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
