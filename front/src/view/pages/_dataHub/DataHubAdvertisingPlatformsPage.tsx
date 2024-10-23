import React, { useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

// Dummy data for charts
const adSpendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Ad Spend ($)',
      data: [2000, 2500, 2200, 3000, 2800, 3500],
      fill: false,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  ],
};

const audienceDemographicsData = {
  labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
  datasets: [
    {
      label: 'Audience Demographics',
      data: [25, 40, 20, 10, 5],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    },
  ],
};

// Connected platforms
const connectedSources = [
  { name: 'Facebook Ads', icon: <FaFacebook size={30} color="#3b5998" /> },
  { name: 'Google Ads', icon: <FaGoogle size={30} color="#4285f4" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Ad Spend</h3>
        <p className="text-2xl font-bold">$12,500</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Cost Per Conversion</h3>
        <p className="text-2xl font-bold">$4.50</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">ROAS</h3>
        <p className="text-2xl font-bold">3.2</p>
      </div>
    </div>

    {/* Connected Advertising Platforms */}
    <div className="connected-platforms mb-8">
      <h3 className="text-lg font-semibold mb-2">Connected Platforms</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {connectedSources.map((source, index) => (
          <div key={index} className="flex items-center bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
            <div className="icon mr-4">{source.icon}</div>
            <div className="name text-lg font-medium">{source.name}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MetricsTab = () => (
  <div className="metrics-tab space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-2">Ad Spend Trends</h3>
      <Line data={adSpendData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Audience Demographics</h3>
      <Doughnut data={audienceDemographicsData} options={{ responsive: true }} />
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
        <li className="bg-gray-100 p-4 rounded shadow">Ad spend increased by 20% last month, yielding a 25% increase in conversions.</li>
        <li className="bg-gray-100 p-4 rounded shadow">ROAS is highest among the 25-34 age demographic.</li>
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

// Main Advertising Platforms Page Component
const DataHubAdvertisingPlatformsPage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-advertising-platforms p-6">
      <h1 className="text-2xl font-semibold mb-4">Advertising Platforms Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubAdvertisingPlatformsPage;
