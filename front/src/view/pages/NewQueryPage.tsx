import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { getDataSources } from "../../services/dataSourceService";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createQuery,
  getQueryById,
  updateQuery,
} from "../../services/queryService";
import { Query } from "../../models/Query";
import { DataSource } from "../../models/DataSource";
import { toast } from "react-toastify";

const NewQueryPage: React.FC = () => {
  const { id: queryId } = useParams<{ id?: string }>(); // Get the data source ID from route params (if editing)
  const isEditing = Boolean(queryId); // If queryId exists, we are in edit mode

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all data sources using React Query
  const { data: dataSources, isLoading: loadingDataSources } = useQuery(
    "dataSources",
    getDataSources
  );

  // React Hook Form to manage the form state
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Mutation to add a new query
  const addMutation = useMutation(createQuery, {
    onSuccess: () => {
      queryClient.invalidateQueries("queries");
      reset();
      toast.success("Query created successfully!"); // Show success toast
      navigate("/query");
    },
  });

  // Mutation to update an existing query
  const updateMutation = useMutation(updateQuery, {
    onSuccess: () => {
      queryClient.invalidateQueries("queries");
      toast.success("Query updated successfully!"); // Show success toast
      navigate("/query");
    },
  });

  // Handler for form submission
  const onSubmit = (data: any) => {
    const queryData: Query = {
      name: data.name,
      dataSource: data.dataSource,
      description: data.description,
      operation: "read",
    };

    if (isEditing) {
      updateMutation.mutate({ _id: queryId!, ...queryData }); // Update query
    } else {
      addMutation.mutate(queryData); // Create query
    }
  };

  const { data: existingQuery, isLoading: loadingExistingQuery } = useQuery(
    ["query", queryId],
    () => getQueryById(queryId!), // Function to fetch a query by its ID
    { enabled: isEditing } // Only run if we are in edit mode
  );

  // Pre-fill form values if editing
  useEffect(() => {
    if (isEditing && existingQuery) {
      reset({
        name: existingQuery.name,
        dataSource: existingQuery.dataSource,
        description: existingQuery.description,
      });
    }
  }, [isEditing, existingQuery, reset]);

  if (loadingDataSources) {
    return <p>Loading data sources...</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-3xl font-bold">Create New Query</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Input */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Query Name</label>
          <input
            {...register("name", { required: true })}
            className="p-3 border border-black rounded-md"
            placeholder="Enter query name"
          />
          {errors.name && (
            <span className="text-red-500">Query name is required</span>
          )}
        </div>

        {/* Data Source Dropdown */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Select Data Source</label>
          <select
            {...register("dataSource", { required: true })}
            className="p-3 border border-black rounded-md"
          >
            <option value="">-- Select Data Source --</option>
            {dataSources?.map((source: DataSource) => (
              <option key={source._id} value={source._id}>
                {source.name}
              </option>
            ))}
          </select>
          {errors.dataSource && (
            <span className="text-red-500">Data source is required</span>
          )}
        </div>

        {/* Query Description Input */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Query Description</label>
          <textarea
            {...register("description", { required: true })}
            className="p-3 border border-black rounded-md"
            placeholder="Write your query in plain text"
            rows={5}
          />
          {errors.description && (
            <span className="text-red-500">Descrption is required</span>
          )}
        </div>

        {/* Hidden Operation Dropdown (for future use) */}
        <div className="hidden">
          <label className="text-lg font-medium">Operation</label>
          <select
            {...register("operation")}
            className="p-3 border border-black rounded-md"
            defaultValue="read"
          >
            <option value="read">Read</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`bg-black text-white px-4 py-2 rounded ${
            addMutation.isLoading ? "opacity-50" : "hover:bg-opacity-90"
          }`}
          disabled={addMutation.isLoading || updateMutation.isLoading}
        >
          {isEditing
            ? updateMutation.isLoading
              ? "Updating..."
              : "Update Query"
            : addMutation.isLoading
            ? "Creating..."
            : "Create Query"}
        </button>
      </form>
    </div>
  );
};

export default NewQueryPage;
