import React, { useState } from "react";
import ReportBlock from "../components/ReportBlock";
import { Link, useNavigate } from "react-router-dom";
import { deleteReport, getReports } from "../../services/reportService";
import { useQuery } from "react-query";

interface ReportSummary {
  _id: string; // Use string if MongoDB ID, adjust if necessary
  name: string;
}

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recent">("recent");
  const [recentReports, setRecentReports] = useState<ReportSummary[]>([]);

  const navigate = useNavigate();

  // Fetch reports when the component loads
  const { error, isLoading } = useQuery('reports', getReports, {
    onError: (error) => {
      console.error("Failed to fetch reports", error);
    },
    onSuccess: (data) => {
      setRecentReports(data);  // Set recent reports (you can categorize or filter as needed)
    },
  });

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


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Oop! Something went wrong</div>;
  }

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
          Reports
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
      </div>
    </div>
  );
};

export default ReportsPage;
