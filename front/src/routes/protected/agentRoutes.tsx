import AgentMarketplacePage from "@/view/pages/agent/AgentMarketPlacePage";
import AgentPage from "@/view/pages/agent/single/AgentPage";
import AgentDashboardPage from "@/view/pages/agent/dashboard/AgentsDashboardPage";
import MarketplaceAgentDetailsPage from "@/view/pages/agent/MarketplaceAgentDetailsPage";
import NewAgentPage from "@/view/pages/agent/NewAgentPage";

const root = "agent";

const routes = [
  { path: root, element: <AgentDashboardPage /> },
  { path: `${root}/id/:id`, element: <AgentPage /> },
  { path: `${root}/new`, element: <NewAgentPage /> },
  { path: `${root}/edit/:id`, element: <NewAgentPage /> },
  { path: `${root}/marketplace`, element: <AgentMarketplacePage /> },
  { path: `${root}/marketplace/:id`, element: <MarketplaceAgentDetailsPage /> },
];

export default routes;
