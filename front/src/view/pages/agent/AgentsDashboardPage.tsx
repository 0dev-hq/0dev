import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./AgentCard";
import { Link } from "react-router-dom";

const agents = [
  {
    id: 1,
    name: "Agent Smith",
    type: "Customer Support",
    activeChats: 5,
    totalChats: 1000,
  },
  {
    id: 2,
    name: "Agent Johnson",
    type: "Sales",
    activeChats: 3,
    totalChats: 800,
  },
  {
    id: 3,
    name: "Agent Brown",
    type: "Technical Support",
    activeChats: 7,
    totalChats: 1200,
  },
  {
    id: 4,
    name: "Agent Jones",
    type: "Billing Support",
    activeChats: 2,
    totalChats: 600,
  },
];

export default function AgentDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link to="/agent/marketplace">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Visit Marketplace
            </Link>
          </Button>
          <Button asChild>
            <Link to="/agent/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Agent
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
