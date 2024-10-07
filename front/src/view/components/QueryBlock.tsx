import React, { useState } from "react";
import { FiEdit, FiTrash2, FiPlay, FiRefreshCw, FiChevronDown, FiChevronUp, FiDatabase } from "react-icons/fi";

// Define the props for the QueryBlock component
interface QueryBlockProps {
  name: string;
  description: string;
  dataSourceName: string;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
  onRebuild: () => void;
  mode: "standard" | "accordion";  // New mode prop to handle both display modes
}

const QueryBlock: React.FC<QueryBlockProps> = ({
  name,
  description,
  dataSourceName,
  onEdit,
  onDelete,
  onRun,
  onRebuild,
  mode = "standard",
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // For accordion mode toggle

  // For Accordion Mode, toggle content visibility
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-300 shadow-sm rounded-lg bg-white p-4 hover:shadow-md transition-shadow">
      {/* Header for Accordion Mode */}
      {mode === "accordion" && (
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={toggleExpand}
        >
          <p className="text-lg font-medium text-gray-700">{name}</p>
          {isExpanded ? (
            <FiChevronUp size={20} className="text-gray-500" />
          ) : (
            <FiChevronDown size={20} className="text-gray-500" />
          )}
        </div>
      )}

      {/* Standard Mode or Expanded content for Accordion Mode */}
      {(mode === "standard" || isExpanded) && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex-grow">
              {mode === "standard" && (<p className="text-lg font-medium text-gray-700">{name}</p>)}
              <p className="text-sm text-gray-500">{description}</p>
              <p className="text-sm text-gray-500 flex items-center pt-4">
                {/* database icon from react icons */}
                <span className="inline-block mr-1">
                  <FiDatabase size={16} />
                </span>

                {dataSourceName}</p>
            </div>

            {/* Actions (Run, Edit, Delete, Rebuild) */}
            <div className="border-l border-gray-300 pl-4 flex flex-col space-y-2">
              <button
                onClick={onRun}
                className="flex items-center text-black hover:text-green-600 transition-colors"
              >
                <FiPlay size={20} />
                <span className="ml-2">Run</span>
              </button>
              <button
                onClick={onRebuild}
                className="flex items-center text-gray-600 hover:text-black"
              >
                <FiRefreshCw size={20} />
                <span className="ml-2">Rebuild</span>
              </button>
              <button
                onClick={onEdit}
                className="flex items-center text-gray-600 hover:text-black"
              >
                <FiEdit size={20} />
                <span className="ml-2">Edit</span>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <FiTrash2 size={20} />
                <span className="ml-2">Delete</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QueryBlock;
