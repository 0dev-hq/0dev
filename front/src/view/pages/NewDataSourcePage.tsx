import React, { useState } from "react";

const NewDataSourcePage = () => {
  const [dataSourceType, setDataSourceType] = useState(""); // Store the selected data source type
  const [file, setFile] = useState(null); // Store the uploaded CSV file

  // Available data source options
  const dataSourceOptions = [
    { value: "mongodb", label: "MongoDB" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "wordpress", label: "WordPress" },
    { value: "googleSheet", label: "Google Sheet" },
    { value: "csv", label: "CSV File" },
  ];

  // Handle file upload (for CSV)
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold">Connect a New Data Source</h2>

      {/* Select Data Source Type */}
      <div className="flex flex-col space-y-2">
        <label className="text-lg">Select Data Source Type</label>
        <select
          value={dataSourceType}
          onChange={(e) => setDataSourceType(e.target.value)}
          className="p-3 border border-black rounded-md focus:outline-none"
        >
          <option value="">-- Select Data Source --</option>
          {dataSourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Fields Based on Data Source Type */}
      {dataSourceType && (
        <div className="mt-6 p-4 border border-black rounded-md">
          {dataSourceType === "mongodb" && (
            <div className="flex flex-col space-y-4">
              <label>MongoDB Connection String</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter MongoDB Connection String"
              />
            </div>
          )}

          {dataSourceType === "postgresql" && (
            <div className="flex flex-col space-y-4">
              <label>PostgreSQL Connection String</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter PostgreSQL Connection String"
              />
              <label>Username</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Username"
              />
              <label>Password</label>
              <input
                type="password"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Password"
              />
            </div>
          )}

          {dataSourceType === "mysql" && (
            <div className="flex flex-col space-y-4">
              <label>MySQL Connection String</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter MySQL Connection String"
              />
              <label>Username</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Username"
              />
              <label>Password</label>
              <input
                type="password"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Password"
              />
            </div>
          )}

          {dataSourceType === "wordpress" && (
            <div className="flex flex-col space-y-4">
              <label>WordPress API Endpoint</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter WordPress API Endpoint"
              />
              <label>Username</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Username"
              />
              <label>Password</label>
              <input
                type="password"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Password"
              />
            </div>
          )}

          {dataSourceType === "googleSheet" && (
            <div className="flex flex-col space-y-4">
              <label>Google Sheet ID</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter Google Sheet ID"
              />
              <label>API Key</label>
              <input
                type="text"
                className="p-3 border border-black rounded-md focus:outline-none"
                placeholder="Enter API Key"
              />
            </div>
          )}

          {dataSourceType === "csv" && (
            <div className="flex flex-col space-y-4">
              <label>Upload CSV File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="p-3 border border-black rounded-md focus:outline-none"
              />
              {file && (
                <p className="text-gray-600">
                  Selected File: <strong>{file.name}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          Save Data Source
        </button>
      </div>
    </div>
  );
};

export default NewDataSourcePage;
