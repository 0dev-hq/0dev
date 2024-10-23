import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import TabContainer from '../../components/TabContainer';
import { FaClipboardList, FaCommentDots } from 'react-icons/fa';

// Dummy data for charts
const responseTrendsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Survey Responses',
      data: [150, 180, 220, 200, 250, 300],
      fill: false,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  ],
};

const ratingDistributionData = {
  labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
  datasets: [
    {
      label: 'Rating Distribution',
      data: [10, 15, 25, 30, 20],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    },
  ],
};

// Connected platforms
const connectedSources = [
  { name: 'SurveyMonkey', icon: <FaClipboardList size={30} color="#FF8C00" /> },
  { name: 'Feedback Form', icon: <FaCommentDots size={30} color="#32CD32" /> },
];

// Tab Content Components
const OverviewTab = () => (
  <div className="overview-tab space-y-8">
    <div className="metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Total Responses</h3>
        <p className="text-2xl font-bold">1,200</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Average Rating</h3>
        <p className="text-2xl font-bold">4.2</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold">Sentiment Score</h3>
        <p className="text-2xl font-bold">78%</p>
      </div>
    </div>

    {/* Connected Survey Platforms */}
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
      <h3 className="text-lg font-semibold mb-2">Response Trends</h3>
      <Line data={responseTrendsData} options={{ responsive: true }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">Rating Distribution</h3>
      <Bar data={ratingDistributionData} options={{ responsive: true }} />
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
        <li className="bg-gray-100 p-4 rounded shadow">Customer satisfaction has increased by 10% over the last quarter.</li>
        <li className="bg-gray-100 p-4 rounded shadow">The majority of feedback is positive, with an average rating of 4 stars.</li>
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

// Main Surveys & Feedback Page Component
const DataHubSurveysFeedbackPage: React.FC = () => {
  const tabs = [
    { label: 'Overview', content: <OverviewTab /> },
    { label: 'Metrics', content: <MetricsTab /> },
    { label: 'Insights', content: <InsightsTab /> },
  ];

  return (
    <div className="data-hub-surveys-feedback p-6">
      <h1 className="text-2xl font-semibold mb-4">Surveys & Feedback Dashboard</h1>
      <TabContainer tabs={tabs} />
    </div>
  );
};

export default DataHubSurveysFeedbackPage;
