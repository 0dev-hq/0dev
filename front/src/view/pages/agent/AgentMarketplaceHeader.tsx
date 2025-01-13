import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function AgentMarketplaceHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Agent Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Browse and add AI agents to supercharge your customer service
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex w-full md:w-auto">
        <Input
          placeholder="Search agents..."
          className="mr-2"
        />
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  )
}

