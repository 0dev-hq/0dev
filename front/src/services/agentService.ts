import { agentApiClient } from "./apiClient";

export type AgentSession = {
  sessionId: string;
  createdAt: string;
};

const baseRoute = "agent";

export const agentService = {
  async listSessions(agentId: string): Promise<AgentSession[]> {
    try {
      const response = await agentApiClient.get(
        `${baseRoute}/${agentId}/session`
      );
      return response.data;
    } catch (error) {
      console.error("Error listing agents", error);
      throw error;
    }
  },

  async interact(
    agentId: string,
    sessionId: string,
    input: string
  ): Promise<string> {
    try {
      const response = await agentApiClient.post(
        `${baseRoute}/${agentId}/interact`,
        {
          input,
          ...(sessionId && { session_id: sessionId }),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error interacting with agent", error);
      throw error;
    }
  },
};
