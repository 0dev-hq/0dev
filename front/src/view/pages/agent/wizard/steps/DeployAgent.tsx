"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function DeployAgent({ config }) {
  const [deploymentStatus, setDeploymentStatus] = useState("idle");

  const handleDeploy = () => {
    setDeploymentStatus("deploying");
    // Simulating deployment process
    setTimeout(() => {
      setDeploymentStatus("success");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Deploy Agent</h2>
      <p className="text-gray-600">
        Review your configuration and deploy the agent.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration Summary</CardTitle>
          <CardDescription>
            Review the details before deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Agent Name:</h3>
                <p>{config.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description:</h3>
                <p>{config.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Selected Integrations:</h3>
                <ul className="list-disc list-inside">
                  {config.selectedIntegrations.map((integration, index) => (
                    <li key={index}>{integration}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Defined Intents:</h3>
                <ul className="list-disc list-inside">
                  {config.intents.map((intent, index) => (
                    <li key={index}>{intent.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Policies:</h3>
                <ul className="list-disc list-inside">
                  {config.policies.map((policy, index) => (
                    <li key={index}>
                      {policy.intent}:{" "}
                      {policy.askConfirmation
                        ? "Ask for confirmation"
                        : "Autonomous"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Button
        onClick={handleDeploy}
        disabled={deploymentStatus !== "idle"}
        className="w-full bg-black hover:bg-gray-800 text-white whitespace-nowrap"
      >
        {deploymentStatus === "idle" && "Deploy Agent"}
        {deploymentStatus === "deploying" && "Deploying..."}
        {deploymentStatus === "success" && "Deployed Successfully"}
      </Button>
      {deploymentStatus === "success" && (
        <div className="flex items-center justify-center text-green-500">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Agent deployed successfully!</span>
        </div>
      )}
    </div>
  );
}
