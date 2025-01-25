import AgentIntegrationExchange from "@/view/pages/agent/wizard/AgentIntegrationExchange";

const root = "up/agent";

const authRoutes = [
  {
    path: `${root}/integration/exchange`,
    element: <AgentIntegrationExchange />,
  },
];

export default authRoutes;
