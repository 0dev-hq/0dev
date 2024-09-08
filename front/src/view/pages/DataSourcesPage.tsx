import React, { useState } from "react";
import { Link } from "react-router-dom";
import DataSourceBlock from "../components/DataSourceBlock";

const DataSourcesPage: React.FC = () => {
  // Simulate existing data sources (replace with dynamic data fetching later)
  const [dataSources, setDataSources] = useState([
    { id: 1, name: "MySQL Database", type: "SQL" },
    { id: 2, name: "PostgreSQL Database", type: "SQL" },
    { id: 3, name: "MongoDB", type: "NoSQL" },
    { id: 4, name: "SQLite Database", type: "SQL" },
    { id: 5, name: "Redis", type: "NoSQL" },
  ]);

  // Handler for adding a new data source (placeholder)
  const handleAddDataSource = () => {
    alert("Add New Data Source");
  };

  // Handler for editing a data source (placeholder)
  const handleEdit = (id: number) => {
    alert(`Edit Data Source with id ${id}`);
  };

  // Handler for deleting a data source (placeholder)
  const handleDelete = (id: number) => {
    alert(`Delete Data Source with id ${id}`);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Button to connect a new data source */}
      <div>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          <Link to="/new-data-source">Connect New Data Source</Link>
        </button>
      </div>

      {/* Existing Data Sources List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Data Sources</h2>
        {dataSources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {dataSources.map((dataSource) => (
              <DataSourceBlock
                key={dataSource.id}
                id={dataSource.id}
                name={dataSource.name}
                type={dataSource.type}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No data sources connected yet.</p>
        )}
      </div>
    </div>
  );
};

export default DataSourcesPage;
