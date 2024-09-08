import React, { useState } from "react";
import ReportBlock from "../components/ReportBlock";

// Define the structure of a Report item
interface Report {
  id: number;
  text: string;
}

const ReportsPage: React.FC = () => {
  // Tab state: 'recent' or 'dataSource'
  const [activeTab, setActiveTab] = useState<"recent" | "dataSource">("recent");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");

  // Dummy data for recent and data source reports
  const recentReports: Report[] = [
    { id: 1, text: "Monthly Sales Report" },
    { id: 2, text: "Customer Satisfaction Report" },
  ];

  const dataSourceReports: { [key: string]: Report[] } = {
    mysql: [
      { id: 1, text: "Sales Transactions Report" },
      { id: 2, text: "Inventory Restock Report" },
    ],
    mongodb: [
      { id: 3, text: "User Activity Report" },
      { id: 4, text: "Product Performance Report" },
    ],
  };

  // Dummy data sources for the dropdown
  const dataSources = [
    { id: "mysql", name: "MySQL Database" },
    { id: "mongodb", name: "MongoDB Database" },
  ];

  // Handlers for the report actions (placeholders)
  const handleView = (id: number) => alert(`View report ${id}`);
  const handleEdit = (id: number) => alert(`Edit report ${id}`);
  const handleDelete = (id: number) => alert(`Delete report ${id}`);

  return (
    <div className="flex flex-col space-y-6">
      {/* New Report Button */}
      <div>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          New Report
        </button>
      </div>

      {/* Tabs for Recent Reports and Data Source Reports */}
      <div className="flex space-x-4 border-b border-black pb-2">
        <button
          className={`${
            activeTab === "recent"
              ? "text-black border-b-2 border-black"
              : "text-gray-600"
          } pb-2`}
          onClick={() => setActiveTab("recent")}
        >
          Recent Reports
        </button>
        <button
          className={`${
            activeTab === "dataSource"
              ? "text-black border-b-2 border-black"
              : "text-gray-600"
          } pb-2`}
          onClick={() => setActiveTab("dataSource")}
        >
          Data Source Reports
        </button>
      </div>

      {/* Report Blocks */}
      <div className="space-y-4">
        {activeTab === "recent" &&
          recentReports.map((report) => (
            <ReportBlock
              key={report.id}
              reportText={report.text}
              onView={() => handleView(report.id)}
              onEdit={() => handleEdit(report.id)}
              onDelete={() => handleDelete(report.id)}
            />
          ))}

        {activeTab === "dataSource" && (
          <div className="flex flex-col space-y-6">
            {/* Dropdown to select a data source */}
            <label className="text-lg">Select Data Source</label>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="p-3 border border-black rounded-md focus:outline-none"
            >
              <option value="">-- Select Data Source --</option>
              {dataSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>

            {/* Show Reports for the selected data source */}
            {selectedDataSource && (
              <div className="space-y-4">
                {dataSourceReports[selectedDataSource]?.map((report) => (
                  <ReportBlock
                    key={report.id}
                    reportText={report.text}
                    onView={() => handleView(report.id)}
                    onEdit={() => handleEdit(report.id)}
                    onDelete={() => handleDelete(report.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
