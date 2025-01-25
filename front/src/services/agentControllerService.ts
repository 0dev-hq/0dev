import { agentApiClient } from "./apiClient";

export type AgentConfig = {
  id?: string;
  name: string;
  description: string;
  selectedIntegrations: SelectedIntegration[];
  intents: string[];
  facts: string[];
  policies: string[];
  categories: string[];
  secrets: Secret[];
};

export type OAuthCredentialValue = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
};

export type CustomCredentialValue = {
  name: string;
  type: "password" | "text";
  value: string;
};

// Define the Integration type with conditional types
export type IntegrationCredentials<T extends "oauth" | "custom"> =
  T extends "oauth"
    ? {
        type: "oauth";
        values: OAuthCredentialValue;
      }
    : {
        type: "custom";
        values: CustomCredentialValue[];
      };

// Define the SelectedIntegration type to handle either OAuth or Custom integrations
export interface SelectedIntegration {
  name: string;
  credentials:
    | IntegrationCredentials<"oauth">
    | IntegrationCredentials<"custom">;
}

export type Secret = {
  name: string;
  value: string;
  description: string;
};

export type AgentListItem = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  totalSessions: number;
};

const baseRoute = "controller";

export const agentControllerService = {
  async createAgent(agentConfig: AgentConfig): Promise<void> {
    try {
      const response = await agentApiClient.post(
        `${baseRoute}/agent`,
        agentConfig
      );
      return response.data;
    } catch (error) {
      console.error("Error creating agent", error);
      throw error;
    }
  },
  async updateAgent(agentId: string, agentConfig: AgentConfig): Promise<void> {
    try {
      const response = await agentApiClient.put(
        `${baseRoute}/agent/${agentId}`,
        agentConfig
      );
      return response.data;
    } catch (error) {
      console.error("Error updating agent", error);
      throw error;
    }
  },
  async listAgents(): Promise<AgentListItem[]> {
    try {
      const response = await agentApiClient.get(`${baseRoute}/agent`);
      return response.data;
    } catch (error) {
      console.error("Error listing agents", error);
      throw error;
    }
  },
  async getAgent(agentId: string): Promise<AgentConfig> {
    try {
      const response = await agentApiClient.get<AgentConfig>(
        `${baseRoute}/agent/${agentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting agent", error);
      throw error;
    }
  },
  async deleteAgent(agentId: string): Promise<void> {
    try {
      const response = await agentApiClient.delete(
        `${baseRoute}/agent/${agentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting agent", error);
      throw error;
    }
  },
};
