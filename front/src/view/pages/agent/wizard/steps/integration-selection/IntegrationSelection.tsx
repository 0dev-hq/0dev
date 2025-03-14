import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrowseIntegrations } from "./BrowseIntegrations";
import { SelectedIntegrations } from "./SelectedIntegrations";
import { availableIntegrations } from "./availableIntegrations";

import type { ConnectionStatus } from "./integration";
import {
  AgentConfig,
  CustomCredentialValue,
} from "@/services/agentControllerService";
import { useToast } from "@/hooks/use-toast";
import { agentIntegrationService } from "@/services/agentIntegrationService";

export default function IntegrationSelection({
  config,
  updateConfig,
}: {
  config: AgentConfig;
  updateConfig: (newData: Partial<AgentConfig>) => void;
}) {
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, ConnectionStatus>
  >({});
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = (event: MessageEvent) => {
      if (event.data.type === "OAUTH_CALLBACK") {
        console.log("Received message", event.data);
        const { integration, success, message } = event.data; // Use `message`
        if (success) {
          setConnectionStatus((prev) => ({
            ...prev,
            [integration]: {
              state: "connected",
              lastChecked: new Date(),
            },
          }));
          updateConfig({
            integrations: config.integrations.map((i) =>
              i.name === integration
                ? {
                    ...i,
                    credentials: {
                      type: "oauth",
                      values: {
                        accessToken: message.accessToken,
                        refreshToken: message.refreshToken,
                        expiresIn: String(message.expiresIn), // Update expiresIn here
                      },
                    },
                  }
                : i
            ),
          });
          toast({
            title: "Integration Connected",
            description: `Successfully connected to ${integration}`,
            variant: "default",
          });
        } else {
          setConnectionStatus((prev) => ({
            ...prev,
            [integration]: {
              state: "error",
              errorMessage: "Failed to connect",
            },
          }));
          toast({
            title: "Connection Failed",
            description: `Failed to connect to ${integration}`,
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener("message", handleOAuthCallback);
    return () => window.removeEventListener("message", handleOAuthCallback);
  }, [config.integrations, updateConfig]);

  const handleRemoveIntegration = (integrationName: string) => {
    updateConfig({
      integrations: config.integrations.filter(
        (i) => i.name !== integrationName
      ),
    });
  }

  const handleToggleIntegration = (
    integration: string,
    integrationType: "oauth" | "custom"
  ) => {
    const newSelectedIntegrations = config.integrations.some(
      (i) => i.name === integration
    )
      ? config.integrations.filter((i) => i.name !== integration)
      : [
          ...config.integrations,
          {
            name: integration,
            credentials:
              integrationType === "oauth"
                ? {
                    type: "oauth" as const,
                    values: {
                      accessToken: "",
                      refreshToken: "",
                      expiresIn: "0",
                    },
                  }
                : { type: "custom" as const, values: [] },
          },
        ];

    updateConfig({ integrations: newSelectedIntegrations });

    if (!newSelectedIntegrations.some((i) => i.name === integration)) {
      setConnectionStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[integration];
        return newStatus;
      });
    }
  };

  const { mutate: initiateOAuthFlow } = useMutation(
    async (integration: string) => {
      const response = await agentIntegrationService.initiateOAuthFlow(
        integration
      );
      return response.auth_url;
    },
    {
      onMutate: (integration) => {
        setConnectionStatus((prev) => ({
          ...prev,
          [integration]: { state: "connecting" },
        }));
      },
      onSuccess: (auth_url) => {
        const width = 600;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
          auth_url,
          "oauth-popup",
          `width=${width},height=${height},left=${left},top=${top}`
        );
      },
      onError: (error, integration) => {
        console.error("Failed to initiate OAuth flow:", error);
        setConnectionStatus((prev) => ({
          ...prev,
          [integration]: {
            state: "error",
            errorMessage: "Failed to initiate OAuth flow",
          },
        }));
        toast({
          title: "OAuth Initiation Failed",
          description: `Failed to start OAuth process for ${integration}`,
          variant: "destructive",
        });
      },
    }
  );

  const updateCustomIntegrationCredentials = (
    integrationName: string,
    values: CustomCredentialValue[]
  ) => {
    updateConfig({
      integrations: config.integrations.map((i) =>
        i.name === integrationName
          ? {
              ...i,
              credentials: {
                type: "custom",
                values,
              },
            }
          : i
      ),
    });
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

        <TabsContent value="browse">
          <BrowseIntegrations
            availableIntegrations={availableIntegrations}
            selectedIntegrations={config.integrations}
            onToggleIntegration={handleToggleIntegration}
          />
        </TabsContent>

        <TabsContent value="selected">
          <SelectedIntegrations
            selectedIntegrations={config.integrations}
            availableIntegrations={availableIntegrations}
            connectionStatus={connectionStatus}
            onRemoveIntegration={handleRemoveIntegration}
            onInitiateOAuth={(integration: string) =>
              initiateOAuthFlow(integration)
            }
            updateConfig={updateConfig}
            onUpdateCustomIntegrationCredentials={
              updateCustomIntegrationCredentials
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
