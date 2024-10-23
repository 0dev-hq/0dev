import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getQueries,
  getQueriesByDataSource,
  deleteQuery,
  rebuildQuery,
} from "../../services/queryService";
import { Link, useNavigate } from "react-router-dom";
import { getDataSources } from "../../services/dataSourceService";
import QueryBlock from "../components/QueryBlock";
import { QueryList } from "../../models/Query";
import { DataSource } from "../../models/DataSource";

const QueriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "dataSource">("recent");
  const [displayMode, setDisplayMode] = useState<"standard" | "accordion">(
    "standard"
  );
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");

  // Fetch all queries for the recent tab
  const queryClient = useQueryClient();
  const { data: recentQueries, isLoading: loadingRecentQueries } = useQuery<
    QueryList[]
  >("recentQueries", getQueries);

  // Fetch data sources
  const { data: dataSources, isLoading: isLoadingDataSources } = useQuery<DataSource[]>(
    "dataSources",
    getDataSources
  );

  // Fetch queries by data source
  const { data: dataSourceQueries, refetch: fetchDataSourceQueries } = useQuery<QueryList[]>(
    ["dataSourceQueries", selectedDataSource],
    () => getQueriesByDataSource(selectedDataSource),
    {
      enabled: false, // Don't fetch until the data source is selected
    }
  );

  const deleteMutation = useMutation(deleteQuery, {
    onSuccess: () => {
      queryClient.invalidateQueries("recentQueries"); // Refetch queries after deletion
      if (selectedDataSource) {
        queryClient.invalidateQueries([
          "dataSourceQueries",
          selectedDataSource,
        ]);
      }
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  const handleRunQuery = (id: string) => {
    navigate(`/query/run?queryId=${id}&page=1`);
  };

  const { mutate: mutateRebuildQuery, isLoading: isRebuildQueryLoading } = useMutation(
    (id: string) => rebuildQuery(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recentQueries"); // Refetch queries after rebuilding
        if (selectedDataSource) {
          queryClient.invalidateQueries([
            "dataSourceQueries",
            selectedDataSource,
          ]);
        }
      },
    }
  );

  const handleRebuildQuery = (id: string) => {
    mutateRebuildQuery(id);
  };

  useEffect(() => {
    if (selectedDataSource) {
      fetchDataSourceQueries();
    }
  }, [selectedDataSource]);

  if (loadingRecentQueries || isLoadingDataSources) {
    return <p>Loading queries...</p>;
  }

  if (isRebuildQueryLoading) {
    return <p>Rebuilding query...</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* New Query Button */}
      <div>
        <Link
          to="/query/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          New Query
        </Link>
      </div>

      {/* Tabs for Recent Queries and Data Source Queries */}
      <div className="flex justify-between items-center border-b border-black pb-2">
        <div className="flex space-x-4">
          <button
            className={`${
              activeTab === "recent"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
            } pb-2`}
            onClick={() => setActiveTab("recent")}
          >
            Recent Queries
          </button>
          <button
            className={`${
              activeTab === "dataSource"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
            } pb-2`}
            onClick={() => setActiveTab("dataSource")}
          >
            Data Source Queries
          </button>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex items-center">
          <label className="mr-2 text-gray-600">Display Mode:</label>
          <select
            value={displayMode}
            onChange={(e) =>
              setDisplayMode(e.target.value as "standard" | "accordion")
            }
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="standard">Standard</option>
            <option value="accordion">Accordion</option>
          </select>
        </div>
      </div>

      {/* Query Blocks */}
      <div className="space-y-4">
        {activeTab === "recent" && (
          <>
            {recentQueries && recentQueries?.length > 0 ? (
              recentQueries.map((query: QueryList) => (
                <QueryBlock
                  mode={displayMode}
                  key={query._id}
                  description={query.description}
                  name={query.name}
                  dataSourceName={query.dataSource?.name || ""}
                  onEdit={() => navigate(`/query/edit/${query._id}`)}
                  onRun={() => handleRunQuery(query._id!)}
                  onDelete={() => handleDelete(query._id!)}
                  onRebuild={() => handleRebuildQuery(query._id!)}
                />
              ))
            ) : (
              <p>No recent queries found.</p>
            )}
          </>
        )}

        {activeTab === "dataSource" && (
          <div className="flex flex-col space-y-6">
            {/* Dropdown to select a data source */}
            <label className="text-lg">Select Data Source</label>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="p-3 border border-black rounded-md focus:outline-none"
            >
              <option value="">-- Select Data Source --</option>
              {dataSources?.map((source) => (
                <option key={source._id} value={source._id}>
                  {source.name}
                </option>
              ))}
            </select>

            {/* Show Queries for the selected data source */}
            {selectedDataSource && (
              <>
                {dataSourceQueries ? (
                  dataSourceQueries.map((query: QueryList) => (
                    <QueryBlock
                      mode={displayMode}
                      key={query._id}
                      description={query.description}
                      name={query.name}
                      dataSourceName={query.dataSource?.name || ""}
                      onEdit={() => navigate(`/query/edit/${query._id}`)}
                      onRun={() => handleRunQuery(query._id!)}
                      onDelete={() => handleDelete(query._id!)}
                      onRebuild={() => handleRebuildQuery(query._id!)}
                    />
                  ))
                ) : (
                  <p>No queries found for the selected data source.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueriesPage;
