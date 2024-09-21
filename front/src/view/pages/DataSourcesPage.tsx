import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import DataSourceBlock from "../components/DataSourceBlock";
import {
  getDataSources,
  deleteDataSource,
  analyze,
} from "../../services/dataSourceService"; // Import services
import { DataSource } from "../../models/DataSource";

const DataSourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch data sources from the backend
  const {
    data: dataSources,
    isLoading,
    isError,
  } = useQuery("dataSources", getDataSources);

  // Mutation to delete a data source
  const deleteMutation = useMutation(deleteDataSource, {
    onSuccess: () => {
      queryClient.invalidateQueries("dataSources"); // Invalidate and refetch the data sources after deletion
    },
    onError: (error) => {
      console.error("Error deleting data source:", error);
    },
  });

  // Handler for editing a data source (redirect to edit data source page)
  const handleEdit = (id: string) => {
    navigate(`/data-source/edit/${id}`);
  };

  // Handler for deleting a data source
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const { mutate: captureSchema, isLoading: isAnalyzing } = useMutation(
    (id: string) => analyze(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("dataSources"); // Refetch data sources after capturing schema
      },
      onError: (error) => {
        console.error("Error capturing schema:", error);
      },
    }
  );

  // Handler for schema capture
  const handleCaptureSchema = (id: string) => {
    captureSchema(id);
  };

  if (isLoading) {
    return <p>Loading data sources...</p>;
  }
  
  
  if (isAnalyzing) {
    return <p>Analyzing the data source...</p>;
  }


  if (isError) {
    return <p>Error loading data sources</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Button to connect a new data source */}
      <div>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          <Link to="/data-source/new">Connect New Data Source</Link>
        </button>
      </div>

      {/* Existing Data Sources List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Data Sources</h2>
        {dataSources?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {dataSources.map((dataSource: DataSource) => (
              <DataSourceBlock
                key={dataSource._id}
                id={dataSource._id!}
                name={dataSource.name}
                type={dataSource.type}
                lastTimeAnalyzed={dataSource.lastTimeAnalyzed} // Pass lastTimeAnalyzed field
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCaptureSchema={handleCaptureSchema} // Add capture schema handler
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No data sources connected yet.</p>
        )}
      </div>
    </div>
  );
};

export default DataSourcesPage;
