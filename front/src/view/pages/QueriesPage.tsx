import React, { useState } from "react";
import QueryBlock from "../components/QueryBlock";

// Define the structure of a Query item
interface Query {
  id: number;
  text: string;
}

const QueriesPage: React.FC = () => {
  // Tab state: 'recent' or 'dataSource'
  const [activeTab, setActiveTab] = useState<"recent" | "dataSource">("recent");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");

  // Dummy data for recent and data source queries
  const recentQueries: Query[] = [
    { id: 1, text: "SELECT * FROM users" },
    { id: 2, text: "SELECT * FROM orders WHERE status = 'shipped'" },
  ];

  const dataSourceQueries: { [key: string]: Query[] } = {
    mysql: [
      { id: 1, text: "SELECT * FROM customers" },
      { id: 2, text: "SELECT * FROM transactions WHERE amount > 1000" },
    ],
    mongodb: [
      { id: 3, text: "SELECT * FROM user_activity" },
      { id: 4, text: "SELECT * FROM product_performance" },
    ],
  };

  // Dummy data sources for the dropdown
  const dataSources = [
    { id: "mysql", name: "MySQL Database" },
    { id: "mongodb", name: "MongoDB Database" },
  ];

  // Handlers for the query actions (placeholders)
  const handleView = (id: number) => alert(`View query ${id}`);
  const handleEdit = (id: number) => alert(`Edit query ${id}`);
  const handleDelete = (id: number) => alert(`Delete query ${id}`);

  return (
    <div className="flex flex-col space-y-6">
      {/* New Query Button */}
      <div>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          New Query
        </button>
      </div>

      {/* Tabs for Recent Queries and Data Source Queries */}
      <div className="flex space-x-4 border-b border-black pb-2">
        <button
          className={`${
            activeTab === "recent"
              ? "text-black border-b-2 border-black"
              : "text-gray-600"
          } pb-2`}
          onClick={() => setActiveTab("recent")}
        >
          Recent Queries
        </button>
        <button
          className={`${
            activeTab === "dataSource"
              ? "text-black border-b-2 border-black"
              : "text-gray-600"
          } pb-2`}
          onClick={() => setActiveTab("dataSource")}
        >
          Data Source Queries
        </button>
      </div>

      {/* Query Blocks */}
      <div className="space-y-4">
        {activeTab === "recent" &&
          recentQueries.map((query) => (
            <QueryBlock
              key={query.id}
              queryText={query.text}
              onView={() => handleView(query.id)}
              onEdit={() => handleEdit(query.id)}
              onDelete={() => handleDelete(query.id)}
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

            {/* Show Queries for the selected data source */}
            {selectedDataSource && (
              <div className="space-y-4">
                {dataSourceQueries[selectedDataSource]?.map((query) => (
                  <QueryBlock
                    key={query.id}
                    queryText={query.text}
                    onView={() => handleView(query.id)}
                    onEdit={() => handleEdit(query.id)}
                    onDelete={() => handleDelete(query.id)}
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

export default QueriesPage;
