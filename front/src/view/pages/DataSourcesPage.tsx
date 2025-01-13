import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import DataSourceBlock from "../components/DataSourceBlock";
import {
  getDataSources,
  deleteDataSource,
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

  if (isLoading) {
    return <p>Loading data sources...</p>;
  }


  if (isError) {
    return <p>Error loading data sources</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90">
          <Link to="/data-source/new">Connect New Data Source</Link>
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Data Sources</h2>
        {dataSources?.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 px-auto">
            {dataSources.map((dataSource: DataSource) => (
              <DataSourceBlock
                key={dataSource._id}
                id={dataSource._id!}
                name={dataSource.name}
                type={dataSource.type}
                lastTimeAnalyzed={dataSource.lastTimeAnalyzed}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
