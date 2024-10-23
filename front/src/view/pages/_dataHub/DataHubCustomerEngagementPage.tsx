import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaMailchimp, FaEnvelopeOpenText } from 'react-icons/fa';

// Dummy data for charts
const openRateData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Email Open Rate (%)',
      data: [20, 25, 30, 35, 40, 38],
      fill: false,
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
    },
  ],
};

const engagementFunnelData = {
  labels: ['Email Sent', 'Opened', 'Clicked', 'Converted'],
  datasets: [
    {
      label: 'Engagement Funnel',
      data: [1000, 700, 350, 150],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

// Connected platforms
const connectedSources = [
  { name: 'Mailchimp', icon: <FaMailchimp size={30} color="#FFE01B" /> },
  { name: 'Engagement Tool', icon: <FaEnvelopeOpenText size={30} color="#FF4500" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Campaigns</h3>
        <p className="text-2xl font-bold">50</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Average Open Rate</h3>
        <p className="text-2xl font-bold">35%</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Click-Through Rate</h3>
        <p className="text-2xl font-bold">20%</p>
      </div>
    </div>

    {/* Connected Engagement Platforms */}
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
      <h3 className="text-lg font-semibold mb-2">Email Open Rate Trends</h3>
      <Line data={openRateData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Engagement Funnel</h3>
      <Bar data={engagementFunnelData} options={{ responsive: true }} />
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
        <li className="bg-gray-100 p-4 rounded shadow">Click-through rate increased by 10% after targeting segmented lists.</li>
        <li className="bg-gray-100 p-4 rounded shadow">Campaigns with subject personalization have a 15% higher open rate.</li>
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

// Main Customer Engagement Page Component
const DataHubCustomerEngagementPage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-customer-engagement p-6">
      <h1 className="text-2xl font-semibold mb-4">Customer Engagement Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubCustomerEngagementPage;
