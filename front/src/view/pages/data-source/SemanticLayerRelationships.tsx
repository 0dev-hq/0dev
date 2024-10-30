import React from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entity, Relationship } from "@/models/DataSource";

interface SemanticLayerRelationshipsProps {
  entities?: Entity[];
  relationships?: Relationship[];
}

const SemanticLayerRelationships: React.FC<SemanticLayerRelationshipsProps> = ({ entities = [], relationships = [] }) => {
  const [editingRelationshipId, setEditingRelationshipId] = useState<
    string | null
  >(null);



  const handleCancelEdit = () => {
    setEditingRelationshipId(null);
  };

  const handleEditRelationship = (id: string) => {
    setEditingRelationshipId(id);
  };

  const handleSaveRelationship = (
    id?: string,
    updatedRelationship: Partial<Relationship>
  ) => {
    
    setEditingRelationshipId(null);
  };

  return (
    <>
      {relationships.map((rel) => (
        <div key={rel._id} className="p-4 border rounded-lg">
          {editingRelationshipId === rel._id ? (
            <div className="space-y-2">
              <Select
                value={rel.fromEntity}
                onValueChange={(value) =>
                  handleSaveRelationship(rel._id, { fromEntity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="From Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity._id} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={rel.toEntity}
                onValueChange={(value) =>
                  handleSaveRelationship(rel._id, { toEntity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="To Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity._id} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={rel.type}
                onValueChange={(value) =>
                  handleSaveRelationship(rel._id, {
                    type: value as Relationship["type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Relationship Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-one">One-to-One</SelectItem>
                  <SelectItem value="one-to-many">One-to-Many</SelectItem>
                  <SelectItem value="many-to-many">Many-to-Many</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={rel.name}
                onChange={(e) =>
                  handleSaveRelationship(rel._id, { name: e.target.value })
                }
                placeholder="Relationship name"
              />
              <Input
                value={rel.attributes?.join(", ")}
                onChange={(e) =>
                  handleSaveRelationship(rel._id, {
                    attributes: e.target.value.split(", "),
                  })
                }
                placeholder="Attributes (comma-separated)"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveRelationship(rel._id, {})}
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
                <span className="font-semibold">{rel.fromEntity}</span>{" "}
                {rel.name} <span className="font-semibold">{rel.toEntity}</span>{" "}
                in a{" "}
                <span className="font-mono text-sm bg-muted px-1 rounded">
                  {rel.type}
                </span>{" "}
                relationship
                {rel.attributes && rel.attributes.length > 0 && (
                  <span>
                    . This relationship involves the following attributes:{" "}
                    {rel.attributes.join(", ")}
                  </span>
                )}
                .
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditRelationship(rel._id)}
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

export default SemanticLayerRelationships;
