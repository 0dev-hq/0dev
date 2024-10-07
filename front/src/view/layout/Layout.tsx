import React from 'react';
import Sidebar from './Sidebar';
import Main from './Main';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Navbar for mobile */}
      <div className="md:hidden w-full">
        <Navbar />
      </div>
      {/* Main Content Area */}
      <div className="flex-grow">
        <Main />
      </div>
    </div>
  );
};

export default Layout;
