import React from "react";
import { FiEdit, FiTrash2, FiFileText, FiDatabase } from "react-icons/fi";
import { Link } from "react-router-dom";

interface DataSourceBlockProps {
  id: number;
  name: string;
  type: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DataSourceBlock: React.FC<DataSourceBlockProps> = ({
  id,
  name,
  type,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-black rounded-md bg-white flex flex-col justify-between">
      <div className="flex-grow p-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-gray-600">{type}</p>
      </div>
      <div className="border-t border-black mt-4 flex">
        {/* List Queries */}
        <Link
          to={`/data-source/${id}/queries`}
          className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3"
        >
          <FiDatabase size={20} />
          <span>List Queries</span>
        </Link>

        {/* List Reports */}
        <Link
          to={`/data-source/${id}/reports`}
          className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3"
        >
          <FiFileText size={20} />
          <span>List Reports</span>
        </Link>

        {/* Edit */}
        <button
          onClick={() => onEdit(id)}
          className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-black p-3"
        >
          <FiEdit size={20} />
          <span>Edit</span>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(id)}
          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white hover:bg-red-700 p-3"
        >
          <FiTrash2 size={20} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default DataSourceBlock;
