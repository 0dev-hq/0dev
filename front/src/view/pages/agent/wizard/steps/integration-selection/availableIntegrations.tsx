import type { Integration } from "./integration";

export const availableIntegrations: Integration[] = [
  {
    name: "HubSpot",
    description: "Connect with HubSpot CRM for contacts and deals.",
    categories: ["CRM", "Sales"],
    authType: "oauth",
  },
  {
    name: "Freshdesk",
    description: "Connect with Freshdesk for helpdesk and ticketing.",
    categories: ["Customer Support", "Ticketing"],
    authType: "custom",
    authInputs: [
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "domain", label: "Domain", type: "text" },
    ],
  },
];
