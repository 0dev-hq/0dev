import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi'; // Importing the info icon

interface TooltipProps {
  message: string;
}

const Tooltip: React.FC<TooltipProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleClick = () => setIsVisible(!isVisible);

  return (
    <div className="relative inline-block">
      <FiInfo
        className="cursor-pointer text-gray-600"  // Adjust icon color and size
        size={16}  // Set icon size
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      {isVisible && (
        <div className="absolute z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg mt-2 left-1/2 transform -translate-x-1/2 break-words">
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
