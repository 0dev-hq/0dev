import { agentApiClient } from "./apiClient";

export type AgentConfig = {
  id?: string;
  name: string;
  description: string;
  selectedIntegrations?: string[];
  intents: string[];
  facts: string[];
  policies: string[];
  categories: string[];
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
};
