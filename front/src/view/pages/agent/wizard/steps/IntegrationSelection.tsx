"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, X, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AgentConfig } from "@/services/agentControllerService";

// Types for connection states
type ConnectionStatus = {
  state: "disconnected" | "connecting" | "connected" | "error";
  errorMessage?: string;
  lastChecked?: Date;
};

const availableIntegrations = [
  {
    name: "Slack",
    description: "Connect with Slack for messaging and notifications.",
    categories: ["Communication", "Collaboration"],
    authType: "oauth",
  },
  {
    name: "Microsoft Teams",
    description: "Integrate with Microsoft Teams for team collaboration.",
    categories: ["Communication", "Collaboration"],
    authType: "oauth",
  },
  {
    name: "Zendesk",
    description: "Integrate with Zendesk for customer support management.",
    categories: ["Customer Support", "Ticketing"],
    authType: "api_key",
    authInputs: [
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "subdomain", label: "Subdomain", type: "text" },
    ],
  },
  {
    name: "Freshdesk",
    description: "Connect with Freshdesk for helpdesk and ticketing.",
    categories: ["Customer Support", "Ticketing"],
    authType: "api_key",
    authInputs: [
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "domain", label: "Domain", type: "text" },
    ],
  },
  {
    name: "Jira",
    description: "Connect with Jira for project and issue tracking.",
    categories: ["Project Management", "Development"],
    authType: "oauth",
  },
  {
    name: "Asana",
    description: "Integrate with Asana for task and project management.",
    categories: ["Project Management", "Collaboration"],
    authType: "oauth",
  },
  {
    name: "GitHub",
    description: "Integrate with GitHub for code and project management.",
    categories: ["Development", "Version Control"],
    authType: "oauth",
  },
  {
    name: "GitLab",
    description: "Connect with GitLab for version control and CI/CD.",
    categories: ["Development", "Version Control"],
    authType: "oauth",
  },
  {
    name: "Google Calendar",
    description:
      "Connect with Google Calendar for scheduling and event management.",
    categories: ["Productivity", "Scheduling"],
    authType: "oauth",
  },
  {
    name: "Trello",
    description: "Integrate with Trello for visual project management.",
    categories: ["Project Management", "Collaboration"],
    authType: "api_key",
    authInputs: [
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "token", label: "Token", type: "password" },
    ],
  },
];

type IntegrationSelectionProps = {
  config: AgentConfig;
  updateConfig: (config: { selectedIntegrations: string[] }) => void;
};

export default function IntegrationSelection({
  config,
  updateConfig,
}: IntegrationSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, ConnectionStatus>
  >({});
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({});

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
  }, [searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const allCategories = availableIntegrations.flatMap(
      (integration) => integration.categories
    );
    return ["All", ...new Set(allCategories)];
  }, []);

  const handleToggleIntegration = (integration: string) => {
    const newSelectedIntegrations = config.selectedIntegrations?.includes(
      integration
    )
      ? config.selectedIntegrations.filter((i) => i !== integration)
      : [...(config.selectedIntegrations || []), integration];

    updateConfig({ selectedIntegrations: newSelectedIntegrations });

    // Clear connection status when removing integration
    if (!newSelectedIntegrations.includes(integration)) {
      setConnectionStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[integration];
        return newStatus;
      });
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[integration];
        return newData;
      });
    }
  };

  const initiateOAuthFlow = async (integration: string) => {
    setConnectionStatus((prev) => ({
      ...prev,
      [integration]: { state: "connecting" },
    }));

    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnectionStatus((prev) => ({
        ...prev,
        [integration]: {
          state: "connected",
          lastChecked: new Date(),
        },
      }));
    } catch (error) {
      setConnectionStatus((prev) => ({
        ...prev,
        [integration]: {
          state: "error",
          errorMessage:
            error instanceof Error ? error.message : "Failed to connect",
        },
      }));
    }
  };

  const handleAPIKeyConnection = async (integration: string) => {
    setConnectionStatus((prev) => ({
      ...prev,
      [integration]: { state: "connecting" },
    }));

    try {
      // Simulate API validation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConnectionStatus((prev) => ({
        ...prev,
        [integration]: {
          state: "connected",
          lastChecked: new Date(),
        },
      }));
    } catch (error) {
      setConnectionStatus((prev) => ({
        ...prev,
        [integration]: {
          state: "error",
          errorMessage:
            error instanceof Error ? error.message : "Invalid credentials",
        },
      }));
    }
  };

  const handleInputChange = (
    integration: string,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: value,
      },
    }));
  };

  const handleReconnect = (integration: string) => {
    const integ = availableIntegrations.find((i) => i.name === integration);
    if (!integ) return;

    setConnectionStatus((prev) => ({
      ...prev,
      [integration]: { state: "disconnected" },
    }));

    if (integ.authType === "oauth") {
      initiateOAuthFlow(integration);
    } else {
      handleAPIKeyConnection(integration);
    }
  };

  const renderConnectionStatus = (integration: string) => {
    const status = connectionStatus[integration];
    const integ = availableIntegrations.find((i) => i.name === integration);

    if (!status || status.state === "disconnected") {
      return (
        <div className="space-y-4">
          {integ?.authType === "oauth" ? (
            <Button
              onClick={() => initiateOAuthFlow(integration)}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Connect with {integration}
            </Button>
          ) : (
            <>
              <div className="space-y-4">
                {integ?.authInputs?.map((input) => (
                  <div key={input.name}>
                    <Label
                      htmlFor={`${integration}-${input.name}`}
                      className="text-sm font-medium"
                    >
                      {input.label}
                    </Label>
                    <Input
                      id={`${integration}-${input.name}`}
                      type={input.type}
                      value={formData[integration]?.[input.name] || ""}
                      onChange={(e) =>
                        handleInputChange(
                          integration,
                          input.name,
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                ))}
                <Button
                  onClick={() => handleAPIKeyConnection(integration)}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Connect
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }

    if (status.state === "connecting") {
      return (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="ml-2">Connecting...</span>
        </div>
      );
    }

    if (status.state === "error") {
      return (
        <div className="space-y-4">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{status.errorMessage || "Connection failed"}</span>
          </div>
          <Button
            onClick={() => handleReconnect(integration)}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>Connected</span>
          </div>
          {status.lastChecked && (
            <span className="text-sm text-gray-500">
              Last verified: {status.lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          onClick={() => handleReconnect(integration)}
          variant="outline"
          className="w-full"
        >
          Reconnect
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">
        Integration Selection
      </h2>
      <p className="text-gray-600">
        Select and connect the services you want to integrate with your agent.
      </p>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="selected">Selected Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
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
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-center">
                        {integration.name}
                        {config.selectedIntegrations?.includes(
                          integration.name
                        ) && (
                          <Badge variant="secondary" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {integration.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() =>
                          handleToggleIntegration(integration.name)
                        }
                        className={`w-full ${
                          config.selectedIntegrations?.includes(
                            integration.name
                          )
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {config.selectedIntegrations?.includes(integration.name)
                          ? "Remove"
                          : "Add Integration"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="selected" className="space-y-6">
          <ScrollArea className="h-[600px] pr-4">
            <AnimatePresence>
              {config.selectedIntegrations?.map((integration) => {
                const integ = availableIntegrations.find(
                  (i) => i.name === integration
                );
                const status = connectionStatus[integration];

                return (
                  <motion.div
                    key={integration}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            {integration}
                            {status?.state === "connected" && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {status?.state === "error" && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleIntegration(integration)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {integ?.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="connection">
                            <AccordionTrigger className="text-sm font-medium">
                              Connection Details
                            </AccordionTrigger>
                            <AccordionContent>
                              {renderConnectionStatus(integration)}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
