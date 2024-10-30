// const SemanticLayerEntities: React.FC =
import React from "react";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entity } from "@/models/DataSource";

type SemanticLayerEntitiesProps = {
  entities?: Entity[];
};

const SemanticLayerEntities: React.FC<SemanticLayerEntitiesProps> = ({ entities = [] }) => {
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);


  const handleEditEntity = (id: string) => {
    setEditingEntityId(id);
  };

  const handleSaveEntity = (id: string, updatedEntity: Partial<Entity>) => {
    
    setEditingEntityId(null);
  };

  const handleCancelEdit = () => {
    setEditingEntityId(null);
  };

  return (
    <>
      {entities.map((entity) => (
        <div key={entity.id} className="p-4 border rounded-lg">
          {editingEntityId === entity.id ? (
            <div className="space-y-2">
              <Input
                value={entity.name}
                onChange={(e) =>
                  handleSaveEntity(entity.id, { name: e.target.value })
                }
                placeholder="Entity name"
                className="font-semibold"
              />
              <Textarea
                value={entity.description}
                onChange={(e) =>
                  handleSaveEntity(entity.id, { description: e.target.value })
                }
                placeholder="Entity description"
              />
              <Input
                value={entity.synonyms?.join(", ")}
                onChange={(e) =>
                  handleSaveEntity(entity.id, {
                    synonyms: e.target.value.split(", "),
                  })
                }
                placeholder="Synonyms (comma-separated)"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveEntity(entity.id, {})}
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
                <span className="font-semibold">{entity.name}</span> is a
                business entity that represents{" "}
                {entity.description.toLowerCase()}. It is mapped to the{" "}
                <span className="font-mono text-sm bg-muted px-1 rounded">
                  {entity.table}
                </span>{" "}
                table in the database
                {entity.synonyms && entity.synonyms.length > 0 && (
                  <span>
                    {" "}
                    and can also be referred to as {entity.synonyms.join(", ")}.
                  </span>
                )}
                .
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditEntity(entity.id)}
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

export default SemanticLayerEntities;
