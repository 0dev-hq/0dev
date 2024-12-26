import { AgentConfig } from "../AgentWizardPage";
import ListEditor from "../components/ListEditor";

type DefineIntentsProps = {
  config: AgentConfig;
  updateConfig: (config: Partial<AgentConfig>) => void;
};

export default function DefineIntents({
  config,
  updateConfig,
}: DefineIntentsProps) {
  const handleAddIntent = (intent: string) => {
    updateConfig({ intents: [...config.intents, intent] });
  };

  const handleUpdateIntent = (oldIntent: string, newIntent: string) => {
    updateConfig({
      intents: config.intents.map((intent) =>
        intent === oldIntent ? newIntent : intent
      ),
    });
  };

  const handleRemoveIntent = (intentToRemove: string) => {
    updateConfig({
      intents: config.intents.filter((intent) => intent !== intentToRemove),
    });
  };

  return (
    <ListEditor
      title="Intents"
      description="Specify the tasks and behaviors your agent should handle."
      items={config.intents}
      onAddItem={handleAddIntent}
      onUpdateItem={handleUpdateIntent}
      onRemoveItem={handleRemoveIntent}
    />
  );
}
