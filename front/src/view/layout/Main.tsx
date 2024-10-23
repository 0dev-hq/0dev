import React from 'react';
import { Outlet } from 'react-router-dom';

const Main: React.FC = () => {
  return (
    <div className="flex-grow  py-8 px-4 mx-auto h-screen overflow-y-auto">
      <Outlet />
    </div>
  );
};

export default Main;
