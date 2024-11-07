import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import {
  addDataSource,
  getDataSourceById,
  testDataSourceConnection,
  updateDataSource,
} from "../../services/dataSourceService";
import { useParams, useNavigate } from "react-router-dom";
import { DataSource } from "../../models/DataSource";
import { useState } from "react";
import {
  FaGoogle,
  FaWordpress,
  FaServer,
  FaShopify,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import {
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiSupabase,
  SiMagento,
  SiWoocommerce,
} from "react-icons/si";

const dataSourceIcons: { [key: string]: JSX.Element } = {
  mongodb: <SiMongodb />,
  postgresql: <SiPostgresql />,
  mysql: <SiMysql />,
  supabase: <SiSupabase />,
  googlesheet: <FaGoogle />,
  wordpress: <FaWordpress />,
  default: <FaServer />,
  shopify: <FaShopify />,
  woocommerce: <SiWoocommerce size={60} />,
  magento: <SiMagento />,
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
  twitter: <FaTwitter />,
};

// Define categories for the data sources
const dataSourceCategories: { [key: string]: string[] } = {
  misc: [
    "mongodb",
    "postgresql",
    "mysql",
    "supabase",
    "googlesheet",
    "wordpress",
  ],
  ecommerce: ["shopify", "woocommerce", "magento"],
  social: ["facebook", "instagram", "twitter"],
};

const NewDataSourcePage = () => {
  const [testStatus, setTestStatus] = useState<"success" | "fail" | "none">(
    "none"
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Extract the query parameter for category
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "all"; // Default to "all" if no query param
  const returnTo = queryParams.get("returnTo") || "/data-source";
  const dataHub = queryParams.get("dataHub") || "";

  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DataSource>();

  const { isLoading: isFetchingData } = useQuery(
    ["dataSource", id],
    () => getDataSourceById(id!),
    {
      enabled: !!id,
      onSuccess: (data) => {
        reset(data);
        setSelectedType(data.type);
        setStep(2);
      },
    }
  );

  const {
    mutate: add,
    isLoading: isAdding,
    isSuccess: addSuccess,
    isError: addError,
  } = useMutation(addDataSource, {
    onSuccess: () => {
      queryClient.invalidateQueries("dataSources");
      console.log("Data source added successfully");
    },
  });

  const {
    mutate: update,
    isLoading: isUpdating,
    isSuccess: updateSuccess,
    isError: updateError,
  } = useMutation(updateDataSource, {
    onSuccess: () => {
      queryClient.invalidateQueries("dataSources");
      console.log("Data source updated successfully");
    },
  });

  const { refetch: testConnection, isFetching: isTestingConnection } = useQuery(
    "testConnection",
    () => {
      testDataSourceConnection({ ...watch(), type: selectedType! }).then(
        (value) => setTestStatus(value ? "success" : "fail")
      );
    },
    {
      enabled: false,
    }
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileContent = await file.text();
      try {
        const jsonContent = JSON.parse(fileContent);
        setValue("connectionString", JSON.stringify(jsonContent)); // Set connectionString directly
      } catch (error) {
        console.error("Invalid JSON format in the file");
      }
    }
  };

  const onSubmit = (data: DataSource) => {


    const newDataSource: DataSource = {
      ...(id ? {} : { dataHub }), // Update should not change the data hub
      name: data.name,
      type: data.type || selectedType!,
      connectionString: data.connectionString,
      username: data.username,
      password: data.password,
      googleSheetId: data.googleSheetId,
      apiKey: data.apiKey,
    };

    if (id) {
      newDataSource.id = id;
      update(newDataSource);
    } else {
      add(newDataSource);
    }
  };

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleCancel = () => {
    navigate(returnTo);
  };

  // Filter the data sources based on the category
  // if the category is "all", return all data sources in dataSourceCategories
  const filteredTypes =
    category === "all"
      ? Object.values(dataSourceCategories).flat()
      : dataSourceCategories[category] || [];

  return (
    <div className="flex flex-col items-center space-y-8">
      <h2 className="text-3xl font-bold">
        {id ? "Edit Data Source" : "Connect a New Data Source"}
      </h2>

      {isFetchingData && <p>Loading data...</p>}

      {step === 1 && (
        <div className="w-full max-w-lg space-y-6">
          <label className="text-lg font-medium">Select Data Source Type</label>
          <div className="grid grid-cols-2 gap-4">
            {filteredTypes.length > 0 ? (
              filteredTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelection(type)}
                  className={`p-4 border rounded-lg flex flex-col items-center space-y-2 ${
                    selectedType === type
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {dataSourceIcons[type] || dataSourceIcons["default"]}
                  <span className="capitalize">{type}</span>
                </button>
              ))
            ) : (
              <p>No data sources available for this category</p>
            )}
          </div>
          {errors.type && (
            <span className="text-red-500">Data source type is required</span>
          )}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/3 py-3 text-white font-semibold rounded-lg bg-gray-500 hover:bg-opacity-90 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedType && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-lg space-y-6"
        >
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
          {selectedType && (
            <div className="space-y-4">
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
                      placeholder="localhost:5432/mydb"
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
              {selectedType === "supabase" && (
                <>
                  <div>
                    <label className="text-lg font-medium">
                      Connection String
                    </label>
                    <input
                      type="text"
                      {...register("connectionString", { required: true })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="aws-0-us-east-1.pooler.supabase.com:6543/postgres"
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
              {selectedType === "mysql" && (
                <>
                  <div>
                    <label className="text-lg font-medium">Server URI</label>
                    <input
                      type="text"
                      {...register("connectionString", { required: true })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="localhost:3306/mydb"
                    />
                    {errors.connectionString && (
                      <span className="text-red-500">URI is required</span>
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
              {selectedType === "googlesheet" && (
                <>
                  <div>
                    <label className="text-lg font-medium">
                      Google Sheet ID
                    </label>
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
                    <label className="text-lg font-medium">
                      Upload Google Sheet JSON
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 text-white font-semibold rounded-lg bg-gray-500 hover:bg-opacity-90 transition"
            >
              Back
            </button>
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
            <p
              className={`text-${
                testStatus === "success" ? "green" : "red"
              }-600 mt-4`}
            >
              {testStatus === "success"
                ? "Connection Successful"
                : "Connection Failed"}
            </p>
          )}
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
      )}
    </div>
  );
};

export default NewDataSourcePage;
