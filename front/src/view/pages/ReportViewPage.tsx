import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { getReport, analyzeBlockGroup } from "../../services/reportService";
import { executeQuery } from "../../services/queryService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiDownload } from "react-icons/fi";
import { formatDate } from "../../utils/datetime";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// BlockGroup type definition
interface BlockGroup {
  blocks: { x: number; y: number }[];
  config: {
    title: string;
    query: string;
    type: "bar" | "pie" | "line" | "table" | "value";
  };
  queryResults?: any[];
  chartParams?: any; // For chart-specific parameters like labels, datasets, etc.
}

// Report type definition
interface Report {
  name: string;
  blockGroups: BlockGroup[];
}

// Table component to render table data
const TableComponent: React.FC<{ queryId: string }> = ({ queryId }) => {
  const {
    data: raw,
    isLoading,
    error,
  } = useQuery(["queryResults", queryId], () => executeQuery(queryId));
  const data = raw?.data;

  if (isLoading) return <div>Loading table data...</div>;
  if (error) return <div>Error loading table data</div>;

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const headers = Object.keys(data[0] || {});

  return (
    <table className="w-full border">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} className="border p-2">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, idx: number) => (
          <tr key={idx}>
            {headers.map((header) => (
              <td key={header} className="border p-2">
                {row[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Single value component to render a KPI or single number
const SingleValueComponent: React.FC<{ queryId: string }> = ({ queryId }) => {
  const {
    data: raw,
    isLoading,
    error,
  } = useQuery(["singleValueResults", queryId], () => executeQuery(queryId));
  const data = raw?.data;

  if (isLoading) return <div>Loading single value...</div>;
  if (error) return <div>Error loading single value</div>;

  const singleValue =
    data && data.length > 0 ? Object.values(data[0])[0] : "No data";

  return <div className="text-center text-2xl font-bold">{singleValue}</div>;
};

// Define a type for chart parameters
const ChartComponent: React.FC<{
  blockGroup: BlockGroup;
  blockGroupIndex: number;
  reportId: string;
}> = ({ blockGroup, blockGroupIndex, reportId }) => {
  const [params, setParams] = useState<{ data: any; options: any }>(null);

   // Mutation to analyze the block if chartParams are missing
   const mutation = useMutation((blockData) =>
    analyzeBlockGroup(
      reportId,
      blockGroupIndex,
      blockData,
      blockGroup.config.query
    ), 
    {
      onSuccess: (data: any) => {
        try {
          const transformFunction = new Function(
            "rawData",
            data.chartParams
          );
          setParams(transformFunction(JSON.stringify(data.data)));
        } catch (e) {
          console.error("Error executing transform function", e);
        }
      }
    }
  );

  // Fetch raw data from the query
  const {
    data: raw,
    isLoading,
    error,
  } = useQuery(["queryResults", blockGroup.config.query], () =>
    executeQuery(blockGroup.config.query), 
    {
      onSuccess: (data) => {
        if (!blockGroup.chartParams) {
          mutation.mutate(data);
        } else {
          try {
            const transformFunction = new Function(
              "rawData",
              blockGroup.chartParams
            );
            setParams(transformFunction(JSON.stringify(data?.data)));
          } catch (e) {
            console.error("Error executing transform function", e);
          }
        }
      }
    }
  );



  if (isLoading) return <div>Loading chart data...</div>;
  if (!raw) return <div>No data...</div>;
  if (error) return <div>Error loading chart data</div>;
  if (!blockGroup.chartParams) return <div>Analyzing chart parameters...</div>;
  if (!params) return <div>Rendering chart...</div>;

  // Render the chart based on the block group type
  switch (blockGroup.config.type) {
    case "bar":
      return <Bar data={params.data} options={params.options} />;
    case "pie":
      return <Pie data={params.data} options={params.options} />;
    case "line":
      return <Line data={params.data} options={params.options} />;
    default:
      return null;
  }
};

// Function to render block group types
const renderBlockGroup = ({
  blockGroup,
  blockGroupIndex,
  reportId,
}: {
  blockGroup: BlockGroup;
  blockGroupIndex: number;
  reportId: string;
}) => {
  switch (blockGroup.config.type) {
    case "bar":
    case "pie":
    case "line":
      return (
        <ChartComponent
          blockGroup={blockGroup}
          blockGroupIndex={blockGroupIndex}
          reportId={reportId}
        />
      );
    case "table":
      return <TableComponent queryId={blockGroup.config.query} />;
    case "value":
      return <SingleValueComponent queryId={blockGroup.config.query} />;
    default:
      return null;
  }
};

// Main ReportViewPage component
const ReportViewPage: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const {
    data: report,
    isLoading,
    error,
  } = useQuery(["report", reportId], () => getReport(reportId!));
  const navigate = useNavigate();

  if (isLoading) return <div>Loading report...</div>;
  if (error) return <div>Failed to load report</div>;
  if (!reportId) {
    navigate("/report");
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${12}, 1fr)`,
    gridTemplateRows: `repeat(${12}, 100px)`,
    gap: "10px",
  };

  const getGridPosition = (blockGroup: BlockGroup) => {
    const minX = Math.min(...blockGroup.blocks.map((b) => b.x));
    const maxX = Math.max(...blockGroup.blocks.map((b) => b.x));
    const minY = Math.min(...blockGroup.blocks.map((b) => b.y));
    const maxY = Math.max(...blockGroup.blocks.map((b) => b.y));

    return {
      gridColumn: `${minX + 1} / ${maxX + 2}`,
      gridRow: `${minY + 1} / ${maxY + 2}`,
    };
  };

  const handleDownloadPDF = (reportName: string = "report") => {
    const input = document.getElementById("report-content"); // The ID of the container wrapping your report content

    html2canvas(input!, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 295; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportName}-${formatDate()}.pdf`);
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{report?.name}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleDownloadPDF(report?.name)}
            className="text-gray-600 hover:text-black flex items-center"
          >
            <FiDownload size={20} />
            <span className="ml-1 text-sm">PDF</span>
          </button>
        </div>
      </div>
      <div id="report-content">
        <div className="grid gap-4 md:hidden">
          {report?.blockGroups.map((blockGroup, idx) => (
            <div key={idx} className="block-group p-4 border rounded-md">
              <h2 className="text-lg font-semibold mb-2">
                {blockGroup.config.title}
              </h2>
              {renderBlockGroup({
                blockGroup,
                blockGroupIndex: idx,
                reportId: reportId!,
              })}
            </div>
          ))}
        </div>
        <div className="hidden md:grid" style={gridStyle}>
          {report?.blockGroups.map((blockGroup, idx) => (
            <div
              key={idx}
              className="block-group p-4 border rounded-md"
              style={getGridPosition(blockGroup)}
            >
              <h2 className="text-lg font-semibold mb-2">
                {blockGroup.config.title}
              </h2>
              {renderBlockGroup({
                blockGroup,
                blockGroupIndex: idx,
                reportId: reportId!,
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportViewPage;
