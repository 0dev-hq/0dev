import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  // Share2,
  MessageSquare,
  BookOpen,
  Shield,
  ChevronRight,
  Key,
  EyeOff,
  Eye,
  Share2,
} from "lucide-react";
import { AgentConfig, IntegrationItem, Secret } from "@/services/agentControllerService";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AgentConfigTabsProps {
  agent: AgentConfig;
}

export default function AgentConfigTabs({ agent }: AgentConfigTabsProps) {
  const [showSecretValue, setShowSecretValue] = useState<Record<string, boolean>>({})

  const toggleSecretVisibility = (secretName: string) => {
    setShowSecretValue((prev) => ({ ...prev, [secretName]: !prev[secretName] }))
  }

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Categories
        </TabsTrigger>
        <TabsTrigger value="intents" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Intents
        </TabsTrigger>
        <TabsTrigger value="facts" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Facts
        </TabsTrigger>
        <TabsTrigger value="policies" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Policies
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Integrations
        </TabsTrigger>
        <TabsTrigger value="secrets" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Secrets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="mt-6">
        <div className="flex flex-wrap gap-2">
          {agent.categories.map((category: string, index: number) => (
            <Badge key={index} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="integrations" className="mt-6">
        <div className="flex flex-wrap gap-2">
          {agent.integrations.map((integration: IntegrationItem
          , index: number) => (
            <Badge key={index} variant="outline">
              {integration.name}
            </Badge>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="intents" className="mt-6">
        <div className="space-y-2">
          {agent.intents.map((intent: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-sm">{intent}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="facts" className="mt-6">
        <div className="space-y-2">
          {agent.facts.map((fact: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
              <span className="text-sm">{fact}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="policies" className="mt-6">
        <div className="space-y-2">
          {agent.policies.map((policy: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-sm">{policy}</span>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="secrets" className="mt-6">
        <div className="space-y-4">
          {agent.secrets &&
            agent.secrets.map((secret: Secret, index: number) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{secret.name}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    type={showSecretValue[secret.name] ? "text" : "password"}
                    value={secret.value}
                    readOnly
                    className="flex-grow"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSecretVisibility(secret.name)}
                  >
                    {showSecretValue[secret.name] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">{secret.description}</p>
              </div>
            ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
