import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ConnectionStatus, Integration } from "./integration";
import {
  SelectedIntegration,
  AgentConfig,
  CustomCredentialValue,
} from "@/services/agentControllerService";
import OAuthIntegration from "./OAuthIntegration";
import CustomIntegration from "./CustomIntegration";

interface SelectedIntegrationsProps {
  selectedIntegrations: SelectedIntegration[];
  availableIntegrations: Integration[];
  connectionStatus: Record<string, ConnectionStatus>;
  onRemoveIntegration: (integration: string) => void;
  onUpdateCustomIntegrationCredentials: (
    integrationName: string,
    values: CustomCredentialValue[]
  ) => void;
  onInitiateOAuth: (integration: string) => void;
  updateConfig: (newData: Partial<AgentConfig>) => void;
}

export function SelectedIntegrations({
  selectedIntegrations,
  availableIntegrations,
  connectionStatus,
  onRemoveIntegration,
  onUpdateCustomIntegrationCredentials,
  onInitiateOAuth,
}: SelectedIntegrationsProps) {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <AnimatePresence>
        {selectedIntegrations.map((integration) => {
          const integ = availableIntegrations.find(
            (i) => i.name === integration.name
          );
          const status = connectionStatus[integration.name];

          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      {integration.name}
                      {status?.state === "connected" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {status?.state === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveIntegration(integration.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {integ?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="connection">
                      <AccordionTrigger className="text-sm font-medium">
                        Connection Details
                      </AccordionTrigger>
                      <AccordionContent>
                        {integration.credentials.type === "oauth" ? (
                          <OAuthIntegration
                            integration={integration}
                            status={status}
                            onInitiateOAuth={onInitiateOAuth}
                          />
                        ) : (
                          <CustomIntegration
                            integrationName={integration.name}
                            values={integration.credentials.values??[]}
                            integ={integ!}
                            updateCredentials={
                              onUpdateCustomIntegrationCredentials
                            }
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </ScrollArea>
  );
}
