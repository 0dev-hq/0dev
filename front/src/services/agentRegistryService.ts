import { apiClient } from "./apiClient";
export interface AgentRegistryAction {
  id: number;
  name: string;
  service: string;
  tags: string[];
  description: string;
  inputs: string[];
  outputs: string[];
  creator: string;
}

const baseRoute = "agent-registry";

export const agentRegistryService = {
  async listActions(): Promise<AgentRegistryAction[]> {
    try {
      const response = await apiClient.get<AgentRegistryAction[]>(
        `/${baseRoute}/action`
      );
      return response.data;
    } catch (error) {
      console.error("Error listing actions:", error);
      throw error;
    }
  },
};
