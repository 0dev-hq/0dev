export type ConnectionStatus = {
  state: "disconnected" | "connecting" | "connected" | "error";
  errorMessage?: string;
  lastChecked?: Date;
};
export interface Integration {
  name: string;
  description: string;
  categories: string[];
  authType: "oauth" | "custom";
  oauthUrl?: string;
  authInputs?: { name: string; label: string; type: string }[];
}
