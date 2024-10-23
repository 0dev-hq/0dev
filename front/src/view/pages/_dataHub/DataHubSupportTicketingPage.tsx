import React, { useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaHeadset, FaEnvelopeOpen } from 'react-icons/fa';

// Dummy data for charts
const ticketVolumeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Tickets Opened',
      data: [300, 450, 400, 500, 550, 600],
      fill: false,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  ],
};

const ticketCategoryData = {
  labels: ['Technical', 'Billing', 'Account', 'Other'],
  datasets: [
    {
      label: 'Ticket Categories',
      data: [50, 25, 15, 10],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    },
  ],
};

// Connected platforms
const connectedSources = [
  { name: 'Support Desk', icon: <FaHeadset size={30} color="#FFA500" /> },
  { name: 'Email Support', icon: <FaEnvelopeOpen size={30} color="#4B0082" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Tickets</h3>
        <p className="text-2xl font-bold">3,500</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Average Resolution Time</h3>
        <p className="text-2xl font-bold">2.5 hrs</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Customer Satisfaction</h3>
        <p className="text-2xl font-bold">87%</p>
      </div>
    </div>

    {/* Connected Support Platforms */}
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
      <h3 className="text-lg font-semibold mb-2">Ticket Volume Trends</h3>
      <Line data={ticketVolumeData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Ticket Category Breakdown</h3>
      <Pie data={ticketCategoryData} options={{ responsive: true }} />
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
        <li className="bg-gray-100 p-4 rounded shadow">Resolution time decreased by 15% last month.</li>
        <li className="bg-gray-100 p-4 rounded shadow">Technical issues make up 50% of all tickets.</li>
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

// Main Support & Ticketing Page Component
const DataHubSupportTicketingPage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-support-ticketing p-6">
      <h1 className="text-2xl font-semibold mb-4">Support & Ticketing Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubSupportTicketingPage;
