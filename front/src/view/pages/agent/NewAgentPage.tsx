import { useParams } from "react-router-dom";
import AgentWizardPage from "./wizard/AgentWizardPage";

export default function NewAgentPage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;

  return (
    <main className="min-h-screen bg-gray-100">
      <AgentWizardPage agentId={agentId} />
    </main>
  );
}
