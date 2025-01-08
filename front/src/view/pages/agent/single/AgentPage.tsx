"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentHeader } from "./components/AgentHeader";
import { ChatBox } from "./components/ChatBox";
import { SessionsList } from "./components/SessionsList";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "react-query";

const agent = {
  id: 1,
  name: "Agent Smith",
  type: "Customer Support",
  status: "Online",
  avatar: "/placeholder.svg?height=100&width=100",
};

export default function AgentPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [activeTab, setActiveTab] = useState("chat");

  const params = useParams<{ id: string }>();
  const agentId = params.id;

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("s");

  useEffect(() => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
      setActiveTab("chat");
    }
  }, [sessionId]);

  const navigate = useNavigate();
  const handleSelectSession = (sessionId: string) => {
    navigate(`/agent/id/${agentId}?sessionId=${sessionId}`);

    setSelectedSessionId(sessionId);
    setActiveTab("chat");
  };

  if (!agentId) {
    return <div>Nope!</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/agent">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <Button>Edit Agent</Button>
      </div>

      <AgentHeader agent={agent} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat with {agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatBox
                agentId={agentId}
                agentName={agent.name}
                sessionId={selectedSessionId}
                onSelectSession={handleSelectSession}
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
              <SessionsList
                onSelectSession={handleSelectSession}
                agentId={agentId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
