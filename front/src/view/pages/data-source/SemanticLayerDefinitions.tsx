import React from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Definition = {
  name: string;
  description: string; // Description of the definition. e.g. Order Amount > 1000 for High Value Orders
};

type SemanticLayerDefinitionsProps = {
  definitions?: Definition[];
};

const SemanticLayerDefinitions: React.FC<SemanticLayerDefinitionsProps> = ({ definitions = [] }) => {
  const [editingDefinitionIndex, setEditingDefinitionIndex] = useState<
    number | null
  >(null);

  const handleEditDefinition = (index: number) => {
    setEditingDefinitionIndex(index);
  };

  const handleSaveDefinition = (
    index: number,
    updatedDefinition: Partial<Definition>
  ) => {
    // setDefinitions(
    //   definitions.map((definition, i) =>
    //     i === index ? { ...definition, ...updatedDefinition } : definition
    //   )
    // );
    setEditingDefinitionIndex(null);
  };

  // const [definitions, setDefinitions] = useState<Definition[]>([
  //   { name: "High Value Order", description: "Order Amount > 1000" },
  //   {
  //     name: "Frequent Customer",
  //     description: "Customer with more than 10 orders",
  //   },
  // ]);

  const handleCancelEdit = () => {
    setEditingDefinitionIndex(null);
  };

  return (
    <>
      {definitions.map((definition, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingDefinitionIndex === index ? (
            <div className="space-y-2">
              <Input
                value={definition.name}
                onChange={(e) =>
                  handleSaveDefinition(index, { name: e.target.value })
                }
                placeholder="Definition name"
                className="font-semibold"
              />
              <Textarea
                value={definition.description}
                onChange={(e) =>
                  handleSaveDefinition(index, { description: e.target.value })
                }
                placeholder="Definition description"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveDefinition(index, {})}
                >
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditDefinition(index)}
                className="mt-2"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default SemanticLayerDefinitions;
