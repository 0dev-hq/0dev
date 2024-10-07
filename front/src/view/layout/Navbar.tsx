import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Logo from '../../assets/0dev-logo.png';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="w-full bg-black text-white">
      {/* Top section with Logo, Centered Links, and Toggle Button */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-10" />
        </div>
        
        {/* Centered Links */}
        <div className="flex space-x-4">
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
