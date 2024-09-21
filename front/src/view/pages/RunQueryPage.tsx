import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { executeQuery } from "../../services/queryService";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RunQueryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get("queryId") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(50); // Fixed page size for now

  const {
    data: queryResults,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ["executeQuery", queryId, page],
    () => executeQuery(queryId, page, pageSize),
    {
      enabled: !!queryId, // Only fetch if queryId is available
    }
  );

  const totalRecords = queryResults?.total || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Handle pagination - navigate to the previous page
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
      navigate(`/run-query?queryId=${queryId}&page=${page - 1}`);
    }
  };

  // Handle pagination - navigate to the next page
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
      navigate(`/run-query?queryId=${queryId}&page=${page + 1}`);
    }
  };

  useEffect(() => {
    refetch(); // Refetch data when page changes
  }, [page, refetch]);

  const downloadCSV = () => {
    if (!queryResults?.data) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(queryResults.data[0]).join(","), // Headers
        ...queryResults.data.map((row: any) =>
          Object.values(row).map(String).join(",")
        ), // Rows
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `query_results_page_${page}.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!queryResults?.data) return;
    const doc = new jsPDF();

    const headers = [Object.keys(queryResults.data[0])];
    const data = queryResults.data.map((row: any) =>
      Object.values(row).map(String)
    );

    autoTable(doc, {
      head: headers,
      body: data,
    });

    doc.save(`query_results_page_${page}.pdf`);
  };

  if (isLoading) {
    return <p>Loading query results...</p>;
  }

  if (isError) {
    return <p>Error executing the query.</p>;
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Query Results</h2>
        {/* Export options */}
        <div className="flex space-x-4">
          <button
            onClick={downloadCSV}
            className="text-gray-600 hover:text-black flex items-center"
          >
            <FiDownload size={20} />
            <span className="ml-1 text-sm">CSV</span>
          </button>
          <button
            onClick={downloadPDF}
            className="text-gray-600 hover:text-black flex items-center"
          >
            <FiDownload size={20} />
            <span className="ml-1 text-sm">PDF</span>
          </button>
        </div>
      </div>

      {/* Render the query results */}
      <div className="space-y-4">
        {queryResults?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {Object.keys(queryResults.data[0]).map((key) => (
                    <th
                      key={key}
                      className="py-3 px-6 text-sm font-medium text-gray-700 border-b border-gray-200"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.data.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className="py-2 px-6 text-sm text-gray-600 border-b"
                      >
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No results found for this query.</p>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className={`px-4 py-2 rounded ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black text-white hover:bg-opacity-90"
          }`}
        >
          Previous Page
        </button>
        <p className="text-gray-600">
          Page {page} of {totalPages}
        </p>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          className={`px-4 py-2 rounded ${
            page >= totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black text-white hover:bg-opacity-90"
          }`}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};

export default RunQueryPage;
