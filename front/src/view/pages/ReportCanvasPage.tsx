import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { getQueries } from "../../services/queryService";
import { Query } from "../../models/Query";
import { Report } from "../../models/Report";
import { useNavigate, useParams } from "react-router-dom";
import { getReport, saveReport } from "../../services/reportService";

Modal.setAppElement("#root");

const GRID_COLUMNS = 12;
const GRID_ROWS = 12;
const BLOCK_SIZE = 80;
const COLORS = [
  "#FFC107",
  "#17A2B8",
  "#28A745",
  "#DC3545",
  "#FD7E14",
  "#6F42C1",
  "#20C997",
  "#FF5733",
  "#FF6F61",
  "#1E7FCB",
];

// BlockGroup interface
interface BlockGroup {
  blocks: { x: number; y: number }[];
  color: string;
  config: {
    title: string;
    query: string;
    type: "bar" | "pie" | "line" | "table" | "value"; // Restrict the type to match the model
  };
}

const ReportCanvasPage: React.FC = () => {
  // Add reportId from the URL using useParams
  const { id: reportId } = useParams();

  // Add useNavigate for navigation after saving
  const navigate = useNavigate();
  const [reportName, setReportName] = useState<string>("");

  // Fetch the report if reportId exists (i.e., if we are in edit mode)
  useEffect(() => {
    const fetchReport = async () => {
      if (reportId) {
        try {
          const report = await getReport(reportId);
          setBlockGroups(report.blockGroups); // Load block groups into the canvas
          setReportName(report.name);
        } catch (error) {
          console.error("Failed to load report", error);
        }
      }
    };

    fetchReport(); // Call fetch function when component mounts
  }, [reportId]);

  const handleSaveReport = async () => {
    if (!reportName) {
      alert("Please enter a report name before saving.");
      return;
    }

    try {
      const report = {
        name: reportName, // Use the reportName from the input
        blockGroups,
      };

      if (reportId) {
        // If we're editing an existing report
        await saveReport({ ...report, _id: reportId });
      } else {
        // If we're creating a new report
        await saveReport(report);
      }

      alert("Report saved successfully!");
      navigate("/report"); // Redirect to reports list or another page
    } catch (err) {
      console.error("Error saving report", err);
      alert("Error saving report");
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blockGroups, setBlockGroups] = useState<BlockGroup[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<BlockGroup | null>(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [modalState, setModalState] = useState<{
    title: string;
    query: string;
    type: "bar" | "pie" | "line" | "table" | "value"; // Restrict the type to match the model
  }>({
    title: "",
    query: "",
    type: "bar",
  });
  const [hoveredGroup, setHoveredGroup] = useState<BlockGroup | null>(null); // Track hovered group
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null); // Track popup position

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const queryData = await getQueries();
        setQueries(queryData);
      } catch (error) {
        console.error("Failed to fetch queries", error);
      }
    };

    fetchQueries();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      context.strokeStyle = "#ccc";
      for (let i = 0; i <= GRID_COLUMNS; i++) {
        context.beginPath();
        context.moveTo(i * BLOCK_SIZE, 0);
        context.lineTo(i * BLOCK_SIZE, GRID_ROWS * BLOCK_SIZE);
        context.stroke();
      }
      for (let j = 0; j <= GRID_ROWS; j++) {
        context.beginPath();
        context.moveTo(0, j * BLOCK_SIZE);
        context.lineTo(GRID_COLUMNS * BLOCK_SIZE, j * BLOCK_SIZE);
        context.stroke();
      }

      // Draw block groups
      blockGroups.forEach((group) => {
        context.fillStyle = group.color;
        group.blocks.forEach((block) => {
          const x = block.x * BLOCK_SIZE;
          const y = block.y * BLOCK_SIZE;
          context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        });

        // Draw the title on the top-left block of the group
        const firstBlock = group.blocks[0];
        if (firstBlock) {
          const minX = Math.min(...group.blocks.map((block) => block.x));
          const maxX = Math.max(...group.blocks.map((block) => block.x));

          const titleMaxWidth = BLOCK_SIZE * (maxX - minX + 1) - 10; // Subtract padding

          context.fillStyle = "black";
          context.font = "12px Arial";

          // Original title and ellipsis
          let title = group.config.title;
          const ellipsis = "...";
          let textWidth = context.measureText(title).width;

          // If the title is too wide, truncate it and add ellipsis
          if (textWidth > titleMaxWidth) {
            while (
              textWidth >
              titleMaxWidth - context.measureText(ellipsis).width
            ) {
              title = title.slice(0, -1); // Remove one character at a time
              textWidth = context.measureText(title).width;
            }
            title += ellipsis; // Add the ellipsis
          }

          // Finally, draw the title (either full or truncated with ellipsis)
          context.fillText(
            title,
            firstBlock.x * BLOCK_SIZE + 5,
            firstBlock.y * BLOCK_SIZE + 15
          );
        }
      });

      // Draw selection rectangle if selecting
      if (selectionStart && selectionEnd) {
        const startX = Math.min(selectionStart.x, selectionEnd.x);
        const startY = Math.min(selectionStart.y, selectionEnd.y);
        const endX = Math.max(selectionStart.x, selectionEnd.x);
        const endY = Math.max(selectionStart.y, selectionEnd.y);

        context.fillStyle = "rgba(0, 123, 255, 0.3)";
        for (let x = startX; x <= endX; x++) {
          for (let y = startY; y <= endY; y++) {
            context.fillRect(
              x * BLOCK_SIZE,
              y * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
          }
        }
      }
    }
  }, [blockGroups, selectionStart, selectionEnd]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / BLOCK_SIZE);
    const y = Math.floor((e.clientY - rect.top) / BLOCK_SIZE);
    setSelectionStart({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect(); // Get the canvas position
    const x = Math.floor((e.clientX - rect.left) / BLOCK_SIZE); // Adjust mouse X relative to canvas
    const y = Math.floor((e.clientY - rect.top) / BLOCK_SIZE); // Adjust mouse Y relative to canvas

    // Track the mouse hover over block groups
    const hoveredIndex = blockGroups.findIndex((group) =>
      group.blocks.some((block) => block.x === x && block.y === y)
    );

    // Set the hovered block group
    const hovered = blockGroups[hoveredIndex];
    if (hoveredIndex !== -1) {
      // This is a new block - not edit mode
      setActiveGroupIndex(hoveredIndex);
    } else {
      setActiveGroupIndex(null);
    }
    setHoveredGroup(hovered || null);

    // If hovered, set the popup position relative to the canvas
    if (hovered) {
      const minX = Math.min(...hovered.blocks.map((block) => block.x));
      const maxX = Math.max(...hovered.blocks.map((block) => block.x));
      const minY = Math.min(...hovered.blocks.map((block) => block.y));
      const maxY = Math.max(...hovered.blocks.map((block) => block.y));
      // Get the scroll offset positions
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      const centerX =
        rect.left + ((minX + maxX + 1) / 2) * BLOCK_SIZE + scrollX;
      const centerY = rect.top + ((minY + maxY + 1) / 2) * BLOCK_SIZE + scrollY;
      setPopupPosition({ x: centerX, y: centerY });
    }

    // Handle block selection for drawing the selection rectangle
    if (isSelecting) {
      setSelectionEnd({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (selectionStart && selectionEnd) {
      const blocks = [];
      const startX = Math.min(selectionStart.x, selectionEnd.x);
      const startY = Math.min(selectionStart.y, selectionEnd.y);
      const endX = Math.max(selectionStart.x, selectionEnd.x);
      const endY = Math.max(selectionStart.y, selectionEnd.y);

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          blocks.push({ x, y });
        }
      }

      const isOverlapping = blockGroups.some((group) =>
        group.blocks.some((block) =>
          blocks.some(
            (newBlock) => block.x === newBlock.x && block.y === newBlock.y
          )
        )
      );

      if (isOverlapping) {
        alert(
          "Selected blocks overlap with an existing group. Please choose a different area."
        );
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }

      // Add new block group
      setActiveGroup({
        blocks,
        color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, 0.8)`,
        config: { title: "", query: "", type: "bar" }, // Default to bar chart
      });
      setModalState({ title: "", query: "", type: "bar" }); // Reset modal state
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setTimeout(() => {
        setModalIsOpen(true);
      }, 100);
    }
  };

  const handleSaveConfig = () => {
    if (activeGroup) {
      const updatedGroup: BlockGroup = {
        ...activeGroup,
        config: { ...modalState }, // Update with modal state
      };
      console.log(`activeGroupIndex: ${activeGroupIndex}`);
      console.log(`updatedGroup to save: ${JSON.stringify(updatedGroup)}`);

      if (activeGroupIndex !== null) {
        const tmp = [...blockGroups];
        console.log(`tmp before: ${JSON.stringify(tmp)}`);
        tmp[activeGroupIndex] = updatedGroup;
        console.log(`tmp after: ${JSON.stringify(tmp)}`);
        setBlockGroups(tmp);
      } else {
        console.log(
          `saving: ${JSON.stringify([...blockGroups, updatedGroup])}`
        );
        setBlockGroups([...blockGroups, updatedGroup]);
      }
      setActiveGroupIndex(null);
      setActiveGroup(null);
      setModalIsOpen(false);
    }
  };

  const handleDeleteGroup = (group: BlockGroup) => {
    setBlockGroups(blockGroups.filter((g) => g !== group));
  };

  const handleEditGroup = (group: BlockGroup) => {
    setActiveGroup(group);
    setModalState({
      title: group.config.title,
      query: group.config.query,
      type: group.config.type,
    });

    setModalIsOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Report Designer</h1>
      <div className="mt-4">
        <label className="block mb-2 max-w-sm">
          Report Name:
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="Enter report name"
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={GRID_COLUMNS * BLOCK_SIZE}
        height={GRID_ROWS * BLOCK_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border-black relative"
        style={{
          border: "1px solid",
          display: "block",
        }}
      />
      <button
        onClick={handleSaveReport}
        className="mt-4 p-2 bg-black text-white rounded max-w-xs"
      >
        {reportId ? "Update Report" : "Save Report"}
      </button>

      {modalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => {
            // Reset everything when the modal is closed without saving
            setActiveGroup(null);
            setActiveGroupIndex(null);
            setModalState({
              title: "",
              query: "",
              type: "bar",
            });
            setSelectionStart(null);
            setSelectionEnd(null);
            setIsSelecting(false);
            setModalIsOpen(false);
          }}
          className="p-6 bg-white rounded-md shadow-lg w-96"
          overlayClassName="fixed inset-0 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Configure Block Group</h2>
          <label className="block mb-2">
            Title:
            <input
              type="text"
              value={modalState.title}
              onChange={(e) =>
                setModalState((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Query:
            <select
              value={modalState.query}
              onChange={(e) =>
                setModalState((prev) => {
                  console.log(`prev: ${JSON.stringify(prev)}`);
                  console.log(
                    `new: ${JSON.stringify({ ...prev, query: e.target.value })}`
                  );
                  return { ...prev, query: e.target.value };
                })
              }
              className="w-full p-2 border rounded mt-1"
            >
              {queries.map((query) => (
                <option key={query._id} value={query._id}>
                  {query.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2">
            Block Type:
            <select
              value={modalState.type}
              onChange={(e) =>
                setModalState((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-2 border rounded mt-1"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Chart</option>
              <option value="table">Table</option>
              <option value="value">Single Value</option>
            </select>
          </label>
          <button
            onClick={handleSaveConfig}
            className="w-full p-2 bg-black text-white rounded mt-4"
          >
            Save
          </button>
        </Modal>
      )}

      {/* Hovered popup with edit and delete buttons */}
      {hoveredGroup && popupPosition && (
        <div
          style={{
            position: "absolute",
            left: popupPosition.x, // Offset for better UX
            top: popupPosition.y,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={() => handleEditGroup(hoveredGroup)}
            className="p-2 hover:bg-gray-200 rounded-full"
            title="Edit"
          >
            <FiEdit size={20} />
          </button>
          <button
            onClick={() => handleDeleteGroup(hoveredGroup)}
            className="p-2 hover:bg-gray-200 rounded-full"
            title="Delete"
          >
            <FiTrash2 size={20} color="red" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportCanvasPage;
