

import { useEffect, useState } from "react";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentHeader } from "./components/AgentHeader";
import { ChatBoxTab } from "./components/ChatBoxTab";
import { SessionsListTab } from "./components/SessionsListTab";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import {
  AgentConfig,
  agentControllerService,
} from "@/services/agentControllerService";
import { agentService } from "@/services/agentService";
import ConfigTab from "./components/ConfigTab";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AgentPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [activeTab, setActiveTab] = useState("chat");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const params = useParams<{ id: string }>();
  const agentId = params.id;

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const loadHistory = searchParams.get("loadHistory");

  const { data: agent, isLoading } = useQuery<AgentConfig>(
    ["agent", agentId],
    async () => agentControllerService.getAgent(agentId!)
  );

  useEffect(() => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
      setActiveTab("chat");
    }
  }, [sessionId]);

  const sessionMutation = useMutation(
    () => agentService.createSession(agentId!),
    {
      onSuccess: (sessionId: string) => {
        handleSelectSession(sessionId, false);
      },
    }
  );

  const deleteAgentMutation = useMutation(
    () => agentControllerService.deleteAgent(agentId!),
    {
      onSuccess: () => {
        navigate("/agent");
      },
    }
  );

  const handleStartNewSession = () => {
    sessionMutation.mutate();
  };

  const navigate = useNavigate();
  const handleSelectSession = (
    sessionId: string,
    shouldLoadHistory: boolean = true
  ) => {
    navigate(
      `/agent/id/${agentId}?sessionId=${sessionId}&loadHistory=${shouldLoadHistory}`
    );

    setSelectedSessionId(sessionId);
    setActiveTab("chat");
  };

  const agentDeleteHandler = async () => {
    setDeleteDialogOpen(false);
    deleteAgentMutation.mutate();
  };

  if (!agentId) {
    return <div>Nope!</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/agent">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <AgentHeader
        agent={{
          name: agent.name,
          categories: agent.categories,
          status: "Online",
        }}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chat with {agent.name}</CardTitle>
                {sessionId && (
                  <Button variant="outline" onClick={handleStartNewSession}>
                    Start New Chat
                  </Button>
                )}
              </CardHeader>
            </CardHeader>
            <CardContent>
              <ChatBoxTab
                agentId={agentId}
                agentName={agent.name}
                sessionId={selectedSessionId}
                shouldLoadHistory={loadHistory === "true"}
                onStartNewSession={handleStartNewSession}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsListTab
                onSelectSession={handleSelectSession}
                agentId={agentId}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config">
          <Card>
            <CardHeader className="flex items-stretch">
              <div className="flex items-start justify-between">
                <CardTitle>Agent Configuration</CardTitle>
                <div className="flex space-x-2">
                  <Link to={`/agent/edit/${agentId}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ConfigTab agent={agent} />
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the agent and remove all of its data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={agentDeleteHandler}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
