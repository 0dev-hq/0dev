import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AgentHeaderProps {
  agent: {
    name: string;
    categories: string[];
    status: string;
    avatar?: string;
  };
}

export function AgentHeader({ agent }: AgentHeaderProps) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={agent.avatar} alt={agent.name} />
        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{agent.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {agent.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
        <Badge
          variant={
            agent.status.toLowerCase() === "online" ? "default" : "secondary"
          }
          className="mt-2"
        >
          {agent.status}
        </Badge>
      </div>
    </div>
  );
}
