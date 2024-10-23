import React, { useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaCreditCard, FaPaypal } from 'react-icons/fa';

// Dummy data for charts
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Total Revenue ($)',
      data: [12000, 15000, 14000, 16000, 17500, 20000],
      fill: false,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  ],
};

const paymentMethodsData = {
  labels: ['Credit Card', 'PayPal', 'Bank Transfer', 'Other'],
  datasets: [
    {
      label: 'Payment Methods',
      data: [65, 20, 10, 5],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    },
  ],
};

// Connected platforms
const connectedSources = [
  { name: 'Credit Card Payments', icon: <FaCreditCard size={30} color="#FF6347" /> },
  { name: 'PayPal', icon: <FaPaypal size={30} color="#003087" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Revenue</h3>
        <p className="text-2xl font-bold">$85,000</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Average Order Value</h3>
        <p className="text-2xl font-bold">$125.00</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Transactions</h3>
        <p className="text-2xl font-bold">3,200</p>
      </div>
    </div>

    {/* Connected Payment Platforms */}
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
      <h3 className="text-lg font-semibold mb-2">Revenue Trends</h3>
      <Line data={revenueData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Payment Methods Breakdown</h3>
      <Doughnut data={paymentMethodsData} options={{ responsive: true }} />
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
        <li className="bg-gray-100 p-4 rounded shadow">Revenue increased by 15% last month, driven by a holiday promotion.</li>
        <li className="bg-gray-100 p-4 rounded shadow">Credit card transactions make up the majority of payments.</li>
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

// Main Payments & Finance Page Component
const DataHubPaymentsFinancePage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-payments-finance p-6">
      <h1 className="text-2xl font-semibold mb-4">Payments & Finance Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubPaymentsFinancePage;
