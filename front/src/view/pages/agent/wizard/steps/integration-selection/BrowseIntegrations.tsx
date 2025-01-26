import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntegrationCard } from "./IntegrationCard";
import type { Integration } from "./integration";
import { IntegrationItem } from "@/services/agentControllerService";

interface BrowseIntegrationsProps {
  availableIntegrations: Integration[];
  selectedIntegrations: IntegrationItem[];
  onToggleIntegration: (integration: string) => void;
}

export function BrowseIntegrations({
  availableIntegrations,
  selectedIntegrations,
  onToggleIntegration,
}: BrowseIntegrationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIntegrations = useMemo(() => {
    return availableIntegrations.filter(
      (integration) =>
        (integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (selectedCategory === "All" ||
          integration.categories.includes(selectedCategory))
    );
  }, [availableIntegrations, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const allCategories = availableIntegrations.flatMap(
      (integration) => integration.categories
    );
    return ["All", ...new Set(allCategories)];
  }, [availableIntegrations]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border-gray-300 rounded-md focus:border-black focus:ring-black text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.name}
              integration={integration}
              isSelected={selectedIntegrations.some(
                (i) => i.name === integration.name
              )}
              onToggle={() => onToggleIntegration(integration.name, integration.authType)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
