

import { useState } from "react";
import { ArrowLeft, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

// This would typically come from an API or database
const agent = {
  id: 1,
  name: "CustomerSupportBot",
  description:
    "An agent that assists with Slack queries, manages Zendesk tickets, and monitors Jira issues.",
  category: "Customer Support",
  integrations: ["Slack", "Zendesk", "Jira"],
  actions: {
    Slack: ["Send a message", "Post in a channel"],
    Zendesk: ["Create a ticket", "Update a ticket"],
    Jira: ["Assign a ticket", "Comment on a ticket"],
  },
  sensors: {
    Slack: ["Monitor mentions in a channel"],
    Zendesk: ["Monitor new tickets"],
    Jira: ["Monitor ticket updates"],
  },
  intents: [
    'Respond to Slack messages mentioning "support."',
    "Create a Zendesk ticket for customer complaints.",
    "Monitor overdue Jira tickets and send reminders.",
  ],
  policies: [
    "Slack: Autonomously respond to simple queries. Ask before escalating to Zendesk.",
    "Zendesk: Autonomously create tickets. Ask before assigning a ticket.",
    "Jira: Autonomously monitor tickets. Ask before sending reminders.",
  ],
};

export default function MarketplaceAgentDetailsPage() {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToAccount = () => {
    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      setIsAdding(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/agent/marketplace">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isAdding}>
              {isAdding ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding to Account...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Account
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {agent.name} to Your Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to add this agent to your account? You can
                customize its settings later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                Cancel
              </Button>
              <Button onClick={handleAddToAccount}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{agent.name}</CardTitle>
                <Badge className="mb-2">{agent.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.integrations.map((integration, index) => (
                  <Badge key={index} variant="secondary">
                    {integration}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{agent.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="capabilities" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="intents">Intents</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>
          <TabsContent value="capabilities">
            <Card>
              <CardHeader>
                <CardTitle>Actions and Sensors</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(agent.actions).map(
                    ([service, actions], index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{service}</AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4">
                            <h4 className="font-medium mt-2">Actions:</h4>
                            <ul className="list-disc list-inside ml-4">
                              {actions.map((action, actionIndex) => (
                                <li key={actionIndex}>{action}</li>
                              ))}
                            </ul>
                            <h4 className="font-medium mt-2">Sensors:</h4>
                            <ul className="list-disc list-inside ml-4">
                              {/* {agent.sensors[service].map(
                                (sensor, sensorIndex) => (
                                  <li key={sensorIndex}>{sensor}</li>
                                )
                              )} */}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="intents">
            <Card>
              <CardHeader>
                <CardTitle>Intents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {agent.intents.map((intent, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{intent}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Policies and Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {agent.policies.map((policy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 flex-shrink-0 mt-0.5">
                        {policy.includes("Autonomously") ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </span>
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
