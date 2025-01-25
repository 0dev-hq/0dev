import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConnectionStatus } from "./integration";
import {
  SelectedIntegration,
} from "@/services/agentControllerService";

export default function OAuthIntegration({
  integration,
  status,
  onInitiateOAuth,
}: {
  integration: SelectedIntegration;
  status?: ConnectionStatus;
  onInitiateOAuth: (integration: string) => void;
}) {
  if (!status || status.state === "disconnected") {
    return (
      <Button
        onClick={() => onInitiateOAuth(integration.name)}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        Connect with {integration.name}
      </Button>
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
          onClick={() => onInitiateOAuth(integration.name)}
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
        onClick={() => onInitiateOAuth(integration.name)}
        variant="outline"
        className="w-full"
      >
        Reconnect
      </Button>
    </div>
  );
}
