
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'

interface AgentCardProps {
  agent: {
    id: number
    name: string
    type: string
    activeChats: number
    totalChats: number
  }
}

export function AgentCard({ agent }: AgentCardProps) {
  const activityPercentage = (agent.activeChats / 10) * 100 // Assuming 10 is the max capacity

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{agent.type}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Activity</span>
            <span>{agent.activeChats} active chats</span>
          </div>
          <Progress value={activityPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-muted-foreground">{agent.totalChats} total chats</span>
          <Link to={`/agent/id/${agent.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

