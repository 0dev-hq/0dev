import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Definition } from "@/models/DataSource";

type SemanticLayerDefinitionsProps = {
  definitions?: Definition[];
  onDefinitionsUpdate: (updatedDefinitions: Definition[]) => void;
};

const SemanticLayerDefinitions: React.FC<SemanticLayerDefinitionsProps> = ({
  definitions = [],
  onDefinitionsUpdate,
}) => {
  const [editingDefinitionIndex, setEditingDefinitionIndex] = useState<number | null>(null);
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [newDefinition, setNewDefinition] = useState<Partial<Definition>>({});

  const handleEditDefinition = (index: number) => {
    setEditingDefinitionIndex(index);
    setNewDefinition(definitions[index]);
  };

  const handleSaveDefinition = () => {
    if (editingDefinitionIndex !== null) {
      const updatedDefinitions = definitions.map((definition, idx) =>
        idx === editingDefinitionIndex ? { ...definition, ...newDefinition } : definition
      );
      onDefinitionsUpdate(updatedDefinitions);
      setEditingDefinitionIndex(null);
      setNewDefinition({});
    }
  };

  const handleDeleteDefinition = (index: number) => {
    const updatedDefinitions = definitions.filter((_, idx) => idx !== index);
    onDefinitionsUpdate(updatedDefinitions);
  };

  const handleAddDefinition = () => {
    if (newDefinition.name && newDefinition.description) {
      onDefinitionsUpdate([...definitions, newDefinition as Definition]);
      setNewDefinition({});
      setIsAddingDefinition(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDefinitionIndex(null);
    setNewDefinition({});
  };

  return (
    <>
      {definitions.map((definition, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingDefinitionIndex === index ? (
            <div className="space-y-2">
              <Input
                value={newDefinition.name || ""}
                onChange={(e) =>
                  setNewDefinition({ ...newDefinition, name: e.target.value })
                }
                placeholder="Definition name"
                className="font-semibold"
              />
              <Textarea
                value={newDefinition.description || ""}
                onChange={(e) =>
                  setNewDefinition({ ...newDefinition, description: e.target.value })
                }
                placeholder="Definition description"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveDefinition}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <span className="font-semibold">{definition.name}</span> is
                defined as{" "}
                <span className="font-mono text-sm bg-muted px-1 rounded">
                  {definition.description}
                </span>
                .
              </p>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditDefinition(index)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteDefinition(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Dialog open={isAddingDefinition} onOpenChange={setIsAddingDefinition}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Definition
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Definition</DialogTitle>
            <DialogDescription>Enter the definition details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newDefinition.name || ""}
              onChange={(e) => setNewDefinition({ ...newDefinition, name: e.target.value })}
              placeholder="Definition name"
            />
            <Textarea
              value={newDefinition.description || ""}
              onChange={(e) => setNewDefinition({ ...newDefinition, description: e.target.value })}
              placeholder="Definition description"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddDefinition}>Add Definition</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerDefinitions;
