import React, { useState, ReactNode } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabContainerProps {
  tabs: Tab[];
}

const TabContainer: React.FC<TabContainerProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tab-container">
      <div className="tab-nav flex space-x-4 border-b-2 border-gray-200 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-gray-700 ${activeTab === index ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabs[activeTab].content}</div>
    </div>
  );
};

export default TabContainer;
