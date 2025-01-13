import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./AgentCard";
import { Link } from "react-router-dom";
import { agentControllerService } from "@/services/agentControllerService";
import { useQuery } from "react-query";

export default function AgentDashboardPage() {
  const { data: agents, isLoading } = useQuery(
    "agents",
    agentControllerService.listAgents
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agents</h1>
        <div className="space-x-2">
          {/* <Button asChild>
            <Link to="/agent/marketplace">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Visit Marketplace
            </Link>
          </Button> */}
          <Button asChild>
            <Link to="/agent/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Agent
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
