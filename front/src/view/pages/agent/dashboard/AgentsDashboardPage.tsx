import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./AgentCard";
import { Link } from "react-router-dom";
import { agentControllerService } from "@/services/agentControllerService";
import { useQuery } from "react-query";

const agents = [
  {
    id: 1,
    name: 'CustomerSupportBot',
    description: 'Assists with customer queries and manages support tickets. This advanced AI agent is designed to handle a wide range of customer inquiries, from simple product questions to complex troubleshooting. It seamlessly integrates with your existing support systems to provide efficient and accurate responses.',
    categories: ['Customer Support', 'Ticketing'],
    totalSessions: 1000,
  },
  {
    id: 2,
    name: 'SalesAssistant',
    description: 'Manages leads and provides sales forecasts. Utilizes advanced analytics to identify potential customers and optimize sales strategies.',
    categories: ['Sales', 'Analytics'],
    totalSessions: 800,
  },
  {
    id: 3,
    name: 'TechSupportAgent',
    description: 'Handles technical issues and provides troubleshooting assistance. Equipped with a vast knowledge base of common technical problems and their solutions.',
    categories: ['Technical Support', 'Knowledge Base'],
    totalSessions: 1200,
  },
  {
    id: 4,
    name: 'BillingHelper',
    description: 'Assists with billing inquiries and payment processing. Securely handles financial transactions and provides detailed explanations of charges and invoices.',
    categories: ['Billing Support', 'Finance'],
    totalSessions: 600,
  },
]

export default function AgentDashboardPage() {

  const { data: agents, isLoading } = useQuery("agents", agentControllerService.listAgents);

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
