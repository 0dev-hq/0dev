import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaHubspot, FaUser } from 'react-icons/fa';

// Dummy data for charts
const engagementTrendsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Customer Engagements',
      data: [100, 200, 180, 250, 300, 350],
      fill: false,
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(75,192,192,1)',
    },
  ],
};

const conversionRateData = {
  labels: ['Lead 1', 'Lead 2', 'Lead 3', 'Lead 4', 'Lead 5'],
  datasets: [
    {
      label: 'Conversion Rate (%)',
      data: [20, 40, 30, 50, 60],
      backgroundColor: 'rgba(153,102,255,0.2)',
      borderColor: 'rgba(153,102,255,1)',
      borderWidth: 1,
    },
  ],
};

// Connected platforms
const connectedPlatforms = [
  { name: 'HubSpot', icon: <FaHubspot size={30} color="#FF7A59" /> },
  { name: 'CRM Tool', icon: <FaUser size={30} color="#0077b5" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Leads</h3>
        <p className="text-2xl font-bold">5,200</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Customers</h3>
        <p className="text-2xl font-bold">1,200</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">High-Value Customers</h3>
        <p className="text-lg font-bold">320</p>
      </div>
    </div>

    {/* Connected CRM Platforms */}
    <div className="connected-platforms mb-8">
      <h3 className="text-lg font-semibold mb-2">Connected Platforms</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {connectedPlatforms.map((platform, index) => (
          <div key={index} className="flex items-center bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
            <div className="icon mr-4">{platform.icon}</div>
            <div className="name text-lg font-medium">{platform.name}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MetricsTab = () => (
  <div className="metrics-tab space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-2">Customer Engagement Trends</h3>
      <Line data={engagementTrendsData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Lead Conversion Rates</h3>
      <Bar data={conversionRateData} options={{ responsive: true }} />
    </div>
  </div>
);

const InsightsTab = () => {
  const [customInsight, setCustomInsight] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);

  const handleSubmit = () => {
    if (customInsight) {
      setChatLog([...chatLog, customInsight, "Here's a custom insight based on your request..."]);
      setCustomInsight('');
    }
  };

  return (
    <div className="insights-tab space-y-4">
      <ul className="space-y-3">
        <li className="bg-gray-100 p-4 rounded shadow">Customer retention has increased by 15% this quarter.</li>
        <li className="bg-gray-100 p-4 rounded shadow">Conversion rates improved significantly after the latest marketing campaign.</li>
      </ul>

      {/* ChatGPT Style Interface */}
      <div className="custom-insights space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Request Custom Insights</h3>
        <div className="chat-box bg-white p-4 rounded shadow space-y-3">
          {chatLog.map((msg, index) => (
            <div key={index} className={`p-2 rounded ${index % 2 === 0 ? 'bg-gray-200' : 'bg-blue-100'}`}>
              {msg}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={customInsight}
          onChange={(e) => setCustomInsight(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-2 border rounded mb-2"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Get Insight</button>
      </div>
    </div>
  );
};

// Main CRM Page Component
const DataHubCRMPage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-crm p-6">
      <h1 className="text-2xl font-semibold mb-4">CRM Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubCRMPage;
