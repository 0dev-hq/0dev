import React from 'react';
import { Outlet } from 'react-router-dom';

const Main: React.FC = () => {
  return (
    <div className="flex-grow bg-cream text-black p-8 max-w-6xl max-auto">
      <Outlet />
    </div>
  );
};

export default Main;
