import React from 'react';
import Sidebar from './Sidebar';
import Main from './Main';

const Layout = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content Area */}
      <Main />
    </div>
  );
};

export default Layout;
