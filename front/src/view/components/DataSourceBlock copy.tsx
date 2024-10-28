import React from "react";
import {
  FiEdit,
  FiTrash2,
  FiFileText,
  FiDatabase,
  FiRefreshCw,
} from "react-icons/fi";
import { Link } from "react-router-dom";

interface DataSourceBlockProps {
  id: string;
  name: string;
  type: string;
  lastTimeAnalyzed?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCaptureSchema: (id: string) => void;
}

const DataSourceBlock: React.FC<DataSourceBlockProps> = ({
  id,
  name,
  type,
  lastTimeAnalyzed,
  onCaptureSchema,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-md flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-500">{type}</p>
          <p className="text-xs text-gray-400 mt-1">
            Last Analyzed:{" "}
            {lastTimeAnalyzed
              ? `${new Date(lastTimeAnalyzed).toLocaleString()} (Local TZ)`
              : "Never"}
          </p>
        </div>
        <button
          onClick={() => onCaptureSchema(id)}
          className="flex items-center px-4 py-2 space-x-2 bg-black hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
        >
          <FiRefreshCw size={16} />
          <span>Analyze</span>
        </button>
      </div>
      <div className="border-t border-gray-200 flex flex-wrap md:flex-nowrap">
        {/* List Queries */}
        <Link
          to={`/data-source/${id}/queries`}
          className="flex-grow md:basis-1/4 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3 transition"
        >
          <FiDatabase size={18} />
          <span className="text-sm font-medium">Queries</span>
        </Link>

        {/* List Reports */}
        <Link
          to={`/data-source/${id}/reports`}
          className="flex-grow md:basis-1/4 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3 transition"
        >
          <FiFileText size={18} />
          <span className="text-sm font-medium">Reports</span>
        </Link>

        {/* Edit */}
        <button
          onClick={() => onEdit(id)}
          className="flex-grow md:basis-1/4 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3 transition"
        >
          <FiEdit size={18} />
          <span className="text-sm font-medium">Edit</span>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(id)}
          className="flex-grow md:basis-1/4 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white p-3 transition"
        >
          <FiTrash2 size={18} />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default DataSourceBlock;
