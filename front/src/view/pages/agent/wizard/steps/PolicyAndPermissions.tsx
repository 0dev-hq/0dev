import { AgentConfig } from "@/services/agentControllerService";
import ListEditor from "../components/ListEditor";

type DefinePoliciesProps = {
  config: AgentConfig;
  updateConfig: (config: Partial<AgentConfig>) => void;
};

export default function DefinePolicies({
  config,
  updateConfig,
}: DefinePoliciesProps) {
  const handleAddPolicy = (policy: string) => {
    updateConfig({ policies: [...config.policies, policy] });
  };

  const handleUpdatePolicy = (oldPolicy: string, newPolicy: string) => {
    updateConfig({
      policies: config.policies.map((policy) => (policy === oldPolicy ? newPolicy : policy)),
    });
  };

  const handleRemovePolicy = (policyToRemove: string) => {
    updateConfig({
      policies: config.policies.filter((policy) => policy !== policyToRemove),
    });
  };

  return (
    <ListEditor
      title="Policies and Permissions"
      description="Specify the policies and permissions your agent should follow."
      items={config.policies}
      onAddItem={handleAddPolicy}
      onUpdateItem={handleUpdatePolicy}
      onRemoveItem={handleRemovePolicy}
    />
  );
}
