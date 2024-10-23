import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Settings } from "lucide-react";
import { getDataHubs } from "@/services/dataHubService"; // Import the service

interface DataHub {
  _id: string;
  name: string;
}

const DataHubLayout: React.FC = () => {
  const location = useLocation();
  const [dataHubs, setDataHubs] = useState<DataHub[]>([]);
  const [selectedHub, setSelectedHub] = useState<string | undefined>(undefined);

  // Fetch data hubs on component mount
  useEffect(() => {
    const fetchDataHubs = async () => {
      try {
        const hubs = await getDataHubs();
        setDataHubs(hubs);
        if (hubs.length > 0) {
          setSelectedHub(hubs[0]._id); // Set default selected hub
        }
      } catch (error) {
        console.error("Failed to fetch data hubs:", error);
      }
    };
    fetchDataHubs();
  }, []);

  // Get the second part of the path to determine the page
  const subPath = location.pathname.split("/")[2];

  // Determine if we are on the dashboard or another data hub page
  const isDashboard = subPath === "dashboard";

  // Don't show the header if the path is /data-hub/new
  if (subPath === "new" || subPath.startsWith("edit")) {
    return <Outlet />;
  }

  return (
    <div className="data-hub-layout w-full">
      {/* Top section with Hub Selector, Settings Icon, and Add Button */}
      <header className="py-4 px-6 border-b border-gray-300 flex justify-between items-center">
        {/* Hub Selector */}
        <div className="flex items-center space-x-4">
          <Select value={selectedHub} onValueChange={setSelectedHub}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a hub" />
            </SelectTrigger>
            <SelectContent>
              {dataHubs.map((hub) => (
                <SelectItem key={hub._id} value={hub._id}>
                  {hub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Settings Icon for navigating to the edit page */}
          {selectedHub && (
            <Link
              to={`/data-hub/edit/${selectedHub}`}
              className="text-gray-600 hover:text-gray-800"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Conditional Add Button */}
        <div className="flex items-center space-x-4">
          {isDashboard ? (
            <Link to="/data-hub/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Data Hub
              </Button>
            </Link>
          ) : (
            // set returnTo, category, and hubId query params
            <Link
              to={`/data-source/new?returnTo=${location.pathName}&category=${subPath}&hubId=${selectedHub}
            `}
            >
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Data Source
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DataHubLayout;
