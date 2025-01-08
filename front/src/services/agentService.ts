import { InteractionMessage } from "@/view/pages/agent/single/components/chatbox-messages/messageTypes";
import { agentApiClient } from "./apiClient";

export type AgentSession = {
  sessionId: string;
  createAt: string;
};

const baseRoute = "agent";

export const agentService = {
  async createSession(agentId: string): Promise<string> {
    try {
      const response = await agentApiClient.post<string>(
        `${baseRoute}/${agentId}/session`
      );
      return response.data;
    } catch (error) {
      console.error("Error creating session", error);
      throw error;
    }
  },
  async listSessions(agentId: string): Promise<AgentSession[]> {
    type RawAgentSession = {
      session_id: string;
      created_at: string;
    };
    try {
      const response = await agentApiClient.get<RawAgentSession[]>(
        `${baseRoute}/${agentId}/session`
      );
      return response.data?.map((session) => ({
        sessionId: session.session_id,
        createAt: session.created_at,
      }));
    } catch (error) {
      console.error("Error listing agents", error);
      throw error;
    }
  },

  async interact(
    agentId: string,
    sessionId: string,
    input: string
  ): Promise<InteractionMessage> {
    try {
      const response = await agentApiClient.post(
        `${baseRoute}/${agentId}/interact`,
        {
          input,
          session_id: sessionId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error interacting with agent", error);
      throw error;
    }
  },

  async loadChatHistory(
    agentId: string,
    sessionId: string
  ): Promise<InteractionMessage[]> {
    try {
      type RawInteractionHistory = {
        interaction: InteractionMessage;
        timestamp: string;
      };
      const response = await agentApiClient.get<RawInteractionHistory[]>(
        `${baseRoute}/${agentId}/session/${sessionId}/history`
      );
      return response.data?.map((history) => history.interaction);
    } catch (error) {
      console.error("Error loading chat history", error);
      throw error;
    }
  },
};
