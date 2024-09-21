import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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
    <div className="w-64 flex flex-col justify-between bg-gray-50">
      <div className="p-6">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-cream">0dev</h1>
      </div>
      <div className="flex-grow px-6">
        {/* Links */}
        <nav className="flex flex-col space-y-4">
          <Link to="/data-source" className="text-cream opacity-75 hover:opacity-100">
            Data Source
          </Link>
          <Link to="/query" className="text-cream opacity-75 hover:opacity-100">
            Queries
          </Link>
          <Link to="/report" className="text-cream opacity-75 hover:opacity-100">
            Reports
          </Link>
        </nav>
      </div>
      {/* Footer Links */}
      <div className="flex flex-col p-6 border-t-2">
        <Link to="/data-source" className="text-cream opacity-75 hover:opacity-100">
          Settings
        </Link>
        <Link to="/data-source" className="text-cream opacity-75 hover:opacity-100 mt-4">
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
