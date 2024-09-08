import React from "react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";

// Define the props for the ReportBlock component
interface ReportBlockProps {
  reportText: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ReportBlock: React.FC<ReportBlockProps> = ({
  reportText,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex justify-between items-center border border-black rounded-md bg-white p-4">
      {/* Main Part (Report Text) */}
      <div className="flex-grow">
        <p className="text-lg">{reportText}</p>
      </div>

      {/* Actions (View, Edit, Delete) */}
      <div className="border-l border-black pl-4 flex flex-col space-y-2">
        <button
          onClick={onView}
          className="flex items-center text-gray-600 hover:text-black"
        >
          <FiEye size={20} />
          <span className="ml-2">View</span>
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
  );
};

export default ReportBlock;
