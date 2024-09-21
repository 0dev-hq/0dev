import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import {
  addDataSource,
  getDataSourceById,
  testDataSourceConnection,
  updateDataSource,
} from "../../services/dataSourceService";
import { useParams } from "react-router-dom";
import { DataSource } from "../../models/DataSource";
import { useEffect, useState } from "react";

// Component for adding/editing a Data Source
const NewDataSourcePage = () => {
  const [testStatus, setTestStatus] = useState<"success" | "fail" | "none">(
    "none"
  );

  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>(); // Get the data source ID from route params (if editing)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty, errors },
  } = useForm<DataSource>();

  const selectedType = watch("type"); // Watch selected data source type

  // Fetch the data source by ID if it's an edit case
  const { isLoading: isFetchingData } = useQuery(
    ["dataSource", id],
    () => getDataSourceById(id!),
    {
      enabled: !!id, // Only run this query if there is an ID (i.e., we're editing)
      onSuccess: (data) => {
        reset(data); // Reset form with the existing data source information
      },
    }
  );

  // Mutation for adding a new data source
  const {
    mutate: add,
    isLoading: isAdding,
    isSuccess: addSuccess,
    isError: addError,
  } = useMutation(addDataSource, {
    onSuccess: () => {
      queryClient.invalidateQueries("dataSources"); // Refetch the data source list
      console.log("Data source added successfully");
    },
  });

  // Mutation for updating an existing data source
  const {
    mutate: update,
    isLoading: isUpdating,
    isSuccess: updateSuccess,
    isError: updateError,
  } = useMutation(updateDataSource, {
    onSuccess: () => {
      queryClient.invalidateQueries("dataSources"); // Refetch the data source list
      console.log("Data source updated successfully");
    },
  });

  const {
    refetch: testConnection,
    isFetching: isTestingConnection,
  } = useQuery(
    "testConnection",
    () => {
      testDataSourceConnection(watch()).then((value) =>
        setTestStatus(value ? "success" : "fail")
      );
    },
    {
      enabled: false, // Disabled by default, will trigger manually
    }
  );

  const onSubmit = (data: DataSource) => {
    const newDataSource: DataSource = {
      name: data.name, // Add the name field
      type: data.type,
      connectionString: data.connectionString,
      username: data.username,
      password: data.password,
      googleSheetId: data.googleSheetId,
      apiKey: data.apiKey,
    };

    if (id) {
      // Pass the ID and the data source object separately
      newDataSource.id = id;
      update(newDataSource);
    } else {
      // Otherwise, it's a new data source
      add(newDataSource);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <h2 className="text-3xl font-bold">
        {id ? "Edit Data Source" : "Connect a New Data Source"}
      </h2>

      {/* Loading data for edit case */}
      {isFetchingData && <p>Loading data...</p>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg space-y-6"
      >
        {/* Name Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Data Source Name</label>
          <input
            {...register("name", { required: true })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a name for the data source"
          />
          {errors.name && (
            <span className="text-red-500">Name is required</span>
          )}
        </div>
        {/* Data Source Type Dropdown */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium">Select Data Source Type</label>
          <select
            {...register("type", { required: true })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!!id}
          >
            <option value="">-- Select Data Source --</option>
            <option value="mongodb">MongoDB</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="wordpress">WordPress</option>
            <option value="googleSheet">Google Sheet</option>
          </select>
          {errors.type && (
            <span className="text-red-500">Data source type is required</span>
          )}
        </div>
        {/* Conditional Fields Based on Data Source Type */}
        {selectedType && (
          <div className="space-y-4">
            {/* MongoDB requires only a connection string */}
            {selectedType === "mongodb" && (
              <div>
                <label className="text-lg font-medium">
                  MongoDB Connection String
                </label>
                <input
                  type="text"
                  {...register("connectionString", { required: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mongodb://username:password@localhost:27017/mydb"
                />
                {errors.connectionString && (
                  <span className="text-red-500">
                    Connection string is required
                  </span>
                )}
              </div>
            )}

            {/* PostgreSQL requires connection string, username, and password */}
            {selectedType === "postgresql" && (
              <>
                <div>
                  <label className="text-lg font-medium">
                    PostgreSQL Connection String
                  </label>
                  <input
                    type="text"
                    {...register("connectionString", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="postgres://localhost:5432/mydb"
                  />
                  {errors.connectionString && (
                    <span className="text-red-500">
                      Connection string is required
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Username</label>
                  <input
                    type="text"
                    {...register("username", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter PostgreSQL username"
                  />
                  {errors.username && (
                    <span className="text-red-500">Username is required</span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter PostgreSQL password"
                  />
                  {errors.password && (
                    <span className="text-red-500">Password is required</span>
                  )}
                </div>
              </>
            )}

            {/* MySQL requires connection string, username, and password */}
            {selectedType === "mysql" && (
              <>
                <div>
                  <label className="text-lg font-medium">
                    MySQL Connection String
                  </label>
                  <input
                    type="text"
                    {...register("connectionString", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mysql://localhost:3306/mydb"
                  />
                  {errors.connectionString && (
                    <span className="text-red-500">
                      Connection string is required
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Username</label>
                  <input
                    type="text"
                    {...register("username", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter MySQL username"
                  />
                  {errors.username && (
                    <span className="text-red-500">Username is required</span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter MySQL password"
                  />
                  {errors.password && (
                    <span className="text-red-500">Password is required</span>
                  )}
                </div>
              </>
            )}

            {/* WordPress requires API endpoint, username, and password */}
            {selectedType === "wordpress" && (
              <>
                <div>
                  <label className="text-lg font-medium">
                    WordPress API Endpoint
                  </label>
                  <input
                    type="text"
                    {...register("connectionString", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/wp-json/"
                  />
                  {errors.connectionString && (
                    <span className="text-red-500">
                      Connection string is required
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Username</label>
                  <input
                    type="text"
                    {...register("username", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter WordPress username"
                  />
                  {errors.username && (
                    <span className="text-red-500">Username is required</span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter WordPress password"
                  />
                  {errors.password && (
                    <span className="text-red-500">Password is required</span>
                  )}
                </div>
              </>
            )}

            {/* Google Sheets requires Sheet ID and API key */}
            {selectedType === "googleSheet" && (
              <>
                <div>
                  <label className="text-lg font-medium">Google Sheet ID</label>
                  <input
                    type="text"
                    {...register("googleSheetId", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Google Sheet ID"
                  />
                  {errors.googleSheetId && (
                    <span className="text-red-500">
                      Google Sheet ID is required
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-lg font-medium">API Key</label>
                  <input
                    type="text"
                    {...register("apiKey", { required: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter API Key"
                  />
                  {errors.apiKey && (
                    <span className="text-red-500">API Key is required</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => testConnection()}
            className={`w-full py-3 font-semibold border-2 rounded-lg ${
              isTestingConnection
                ? "bg-gray-400 text-black border-black"
                : testStatus === "success"
                ? "bg-green-500 text-white border-green-500"
                : testStatus === "fail"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-black border-black"
            }`}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </button>
          <button
            type="submit"
            className={`w-full py-3 text-white font-semibold rounded-lg ${
              isAdding || isUpdating
                ? "bg-gray-400"
                : "bg-black hover:bg-opacity-90 transition"
            }`}
            disabled={isAdding || isUpdating}
          >
            {isAdding || isUpdating
              ? "Saving..."
              : id
              ? "Update Data Source"
              : "Save Data Source"}
          </button>
        </div>
        {testStatus !== "none" && (
          <p className={`text-${testStatus === "success" ? "green" : "red"}-600 mt-4`}>
            {testStatus === "success" ? "Connection Successful" : "Connection Failed"}
          </p>
        )}
        {/* Success and Error Messages */}
        {(addSuccess || updateSuccess) && (
          <p className="text-green-600 mt-4">
            {id
              ? "Data source updated successfully!"
              : "Data source added successfully!"}
          </p>
        )}
        {(addError || updateError) && (
          <p className="text-red-600 mt-4">
            Error {id ? "updating" : "adding"} data source
          </p>
        )}
      </form>
    </div>
  );
};

export default NewDataSourcePage;
