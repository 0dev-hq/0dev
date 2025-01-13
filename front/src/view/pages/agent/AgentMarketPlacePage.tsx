import { AgentMarketplaceHeader } from "./AgentMarketplaceHeader"
import { MarketplaceAgentCard } from "./MarketplaceAgentCard"


const agents = [
  {
    id: 1,
    name: 'CustomerSupportBot',
    description: 'An agent that assists with Slack queries, manages Zendesk tickets, and monitors Jira issues.',
    category: 'Customer Support',
    integrations: ['Slack', 'Zendesk', 'Jira'],
  },
  {
    id: 2,
    name: 'SalesAssistant',
    description: 'Manages leads in CRM, schedules meetings, and provides sales forecasts.',
    category: 'Sales',
    integrations: ['Salesforce', 'Calendly', 'Slack'],
  },
  {
    id: 3,
    name: 'DevOpsMonitor',
    description: 'Monitors system health, manages incident responses, and updates documentation.',
    category: 'IT Operations',
    integrations: ['PagerDuty', 'GitHub', 'Confluence'],
  },
  // Add more agents as needed
]

export default function AgentMarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AgentMarketplaceHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {agents.map((agent) => (
          <MarketplaceAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

