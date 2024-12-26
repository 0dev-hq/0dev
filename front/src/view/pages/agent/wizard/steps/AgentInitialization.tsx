import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgentConfig } from "../AgentWizardPage";
import ListEditor from "../components/ListEditor";

type AgentInitializationProps = {
  config: AgentConfig;
  updateConfig: (newData: Partial<AgentConfig>) => void;
};

export default function AgentInitialization({
  config,
  updateConfig,
}: AgentInitializationProps) {
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description);

  const handleChange = () => {
    updateConfig({ name, description });
  };

  const handleAddCategory = (category: string) => {
    updateConfig({ categories: [...config.categories, category] });
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
    updateConfig({
      categories: config.categories.map((cat) =>
        cat === oldCategory ? newCategory : cat
      ),
    });
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    updateConfig({
      categories: config.categories.filter((cat) => cat !== categoryToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Basic Information</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-black">
            Agent Name
          </Label>
          <Input
            id="agent-name"
            placeholder="CustomerSupportBot"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              handleChange();
            }}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-description" className="text-black">
            Description
          </Label>
          <Textarea
            id="agent-description"
            placeholder="An agent that assists with Slack queries, manages Zendesk tickets, and monitors Jira issues."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleChange();
            }}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        <div className="space-y-2">
          <ListEditor
            title="Categories"
            description="Add categories to classify your agent's capabilities"
            items={config.categories}
            onAddItem={handleAddCategory}
            onUpdateItem={handleUpdateCategory}
            onRemoveItem={handleRemoveCategory}
          />
        </div>
      </div>
    </div>
  );
}
