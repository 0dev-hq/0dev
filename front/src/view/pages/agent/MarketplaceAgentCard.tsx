import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

interface AgentCardProps {
  agent: {
    id: number
    name: string
    description: string
    category: string
    integrations: string[]
  }
}

export function MarketplaceAgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        <Badge className="mt-2">{agent.category}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{agent.description}</p>
        <div className="flex flex-wrap gap-2">
          {agent.integrations.map((integration, index) => (
            <Badge key={index} variant="secondary">{integration}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button asChild variant="outline">
          <Link to={`/agent/marketplace/${agent.id}`}>
            View Details
          </Link>
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Account
        </Button>
      </CardFooter>
    </Card>
  )
}

