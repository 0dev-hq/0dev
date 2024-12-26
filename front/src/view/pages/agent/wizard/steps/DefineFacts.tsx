import { AgentConfig } from "../AgentWizardPage";
import ListEditor from "../components/ListEditor";

type DefineFactsProps = {
  config: AgentConfig;
  updateConfig: (config: Partial<AgentConfig>) => void;
};

export default function DefineFacts({
  config,
  updateConfig,
}: DefineFactsProps) {
  const handleAddFact = (fact: string) => {
    updateConfig({ facts: [...config.facts, fact] });
  };

  const handleUpdateFact = (oldFact: string, newFact: string) => {
    updateConfig({
      facts: config.facts.map((fact) => (fact === oldFact ? newFact : fact)),
    });
  };

  const handleRemoveFact = (factToRemove: string) => {
    updateConfig({
      facts: config.facts.filter((fact) => fact !== factToRemove),
    });
  };

  return (
    <ListEditor
      title="Facts"
      description="Specify the facts and knowledge your agent should be aware of."
      items={config.facts}
      onAddItem={handleAddFact}
      onUpdateItem={handleUpdateFact}
      onRemoveItem={handleRemoveFact}
    />
  );
}
