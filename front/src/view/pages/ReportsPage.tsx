import React, { useState, useEffect } from "react";
import ReportBlock from "../components/ReportBlock";
import { Link, useNavigate } from "react-router-dom";
import { deleteReport, getReports } from "../../services/reportService";

interface ReportSummary {
  _id: string; // Use string if MongoDB ID, adjust if necessary
  name: string;
}

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "dataSource">("recent");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [recentReports, setRecentReports] = useState<ReportSummary[]>([]);
  const [dataSourceReports, setDataSourceReports] = useState<{
    [key: string]: ReportSummary[];
  }>({});

  const navigate = useNavigate();

  // Fetch reports when the component loads
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reports = await getReports(); // Fetch all reports
        // Assuming that the backend doesn't categorize recent and dataSource reports, you'd need to filter/split accordingly
        setRecentReports(reports); // Set as recent reports (you could filter or categorize as needed)
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };
    fetchReports();
  }, []);

  // Handlers
  const handleView = (id: string) => navigate(`/report/view/${id}`);
  const handleEdit = (id: string) => navigate(`/report/edit/${id}`);
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id); // Delete report from the backend
        setRecentReports(recentReports.filter(report => report._id !== id)); // Update state after deletion
      } catch (error) {
        console.error("Failed to delete report", error);
      }
    }
  };

  const dataSources = [
    { id: "mysql", name: "MySQL Database" },
    { id: "mongodb", name: "MongoDB Database" },
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* New Report Button */}
      <div>
        <Link to="/report/new" className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          New Report
        </Link>
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
              key={report._id}
              reportText={report.name} // Assuming 'name' is the text for the report
              onView={() => handleView(report._id)}
              onEdit={() => handleEdit(report._id)}
              onDelete={() => handleDelete(report._id)}
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
                    key={report._id}
                    reportText={report.name} // Assuming 'name' is the text for the report
                    onView={() => handleView(report._id)}
                    onEdit={() => handleEdit(report._id)}
                    onDelete={() => handleDelete(report._id)}
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
