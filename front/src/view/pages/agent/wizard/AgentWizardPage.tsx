"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AgentInitialization from "./steps/AgentInitialization";
import IntegrationSelection from "./steps/IntegrationSelection";
import DefineIntents from "./steps/DefineIntents";
import DefineFacts from "./steps/DefineFacts";
import PolicyAndPermissions from "./steps/PolicyAndPermissions";
import DeployAgent from "./steps/DeployAgent";
import YamlUpload from "./components/YamlUpload";
import { AgentConfig } from "@/services/agentControllerService";

const steps = [
  "Configuration File Upload",
  "Basic Information",
  // "Integrations",
  "Intents",
  "Facts",
  "Policy and Permissions",
  "Deploy",
];


export default function AgentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "",
    description: "",
    selectedIntegrations: [],
    intents: [],
    facts: [],
    policies: [],
    categories: [],
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = (newData: Partial<typeof agentConfig>) => {
    setAgentConfig({ ...agentConfig, ...newData });
  };

  const handleConfigLoaded = (loadedConfig: any) => {
    updateConfig(loadedConfig);
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case "Configuration File Upload":
        return <YamlUpload onConfigLoaded={handleConfigLoaded} />;
      case "Basic Information":
        return (
          <AgentInitialization
            config={agentConfig}
            updateConfig={updateConfig}
          />
        );
      case "Integrations":
        return (
          <IntegrationSelection
            config={agentConfig}
            updateConfig={updateConfig}
          />
        );
      case "Intents":
        return (
          <DefineIntents config={agentConfig} updateConfig={updateConfig} />
        );
      case "Facts":
        return <DefineFacts config={agentConfig} updateConfig={updateConfig} />;
      case "Policy and Permissions":
        return (
          <PolicyAndPermissions
            config={agentConfig}
            updateConfig={updateConfig}
          />
        );
      case "Deploy":
        return <DeployAgent config={agentConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-3xl font-bold text-gray-800">
            New Agent Wizard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-sm font-medium ${
                    index <= currentStep ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {step}
                </motion.div>
              ))}
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black"
                ></motion.div>
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="bg-black hover:bg-gray-800 text-white whitespace-nowrap"
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
