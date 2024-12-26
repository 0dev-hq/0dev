import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AgentListItem } from "@/services/agentControllerService";

interface AgentCardProps {
  agent: AgentListItem;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{agent.name}</CardTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.categories.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {agent.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Total Sessions:</span>
            <span className="ml-2">{agent.totalSessions}</span>
          </div>
          <Button asChild variant="outline">
            <Link to={`/agent/id/${agent.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
