import { agentApiClient } from "./apiClient";

const baseRoute = "integration";

export const agentIntegrationService = {
  async initiateOAuthFlow(integration: string): Promise<{ auth_url: string }> {
    const response = await agentApiClient.get<{ auth_url: string }>(
      `/${baseRoute}/oauth/${integration}/authorize`
    );
    return response.data;
  },

  async connectWithApiKey(
    integration: string,
    credentials: Record<string, string>
  ): Promise<void> {
    await agentApiClient.post(
      `/${baseRoute}/${integration}/connect`,
      credentials
    );
  },
};
