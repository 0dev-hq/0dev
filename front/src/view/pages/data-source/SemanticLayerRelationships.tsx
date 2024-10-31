import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Check, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entity, Relationship } from "@/models/DataSource";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SemanticLayerRelationshipsProps {
  entities?: Entity[];
  relationships?: Relationship[];
  onRelationshipsUpdate: (updatedRelationships: Relationship[]) => void;
}

const SemanticLayerRelationships: React.FC<SemanticLayerRelationshipsProps> = ({
  entities = [],
  relationships = [],
  onRelationshipsUpdate,
}) => {
  const [editingRelationshipIndex, setEditingRelationshipIndex] = useState<number | null>(null);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [newRelationship, setNewRelationship] = useState<Partial<Relationship>>({});

  const handleCancelEdit = () => {
    setEditingRelationshipIndex(null);
  };

  const handleEditRelationship = (index: number) => {
    setEditingRelationshipIndex(index);
    setNewRelationship(relationships[index]);
  };

  const handleSaveRelationship = () => {
    if (editingRelationshipIndex !== null) {
      const updatedRelationships = relationships.map((rel, idx) =>
        idx === editingRelationshipIndex ? { ...rel, ...newRelationship } : rel
      );
      onRelationshipsUpdate(updatedRelationships);
      setEditingRelationshipIndex(null);
      setNewRelationship({});
    }
  };

  const handleDeleteRelationship = (index: number) => {
    const updatedRelationships = relationships.filter((_, idx) => idx !== index);
    onRelationshipsUpdate(updatedRelationships);
  };

  const handleAddRelationship = () => {
    if (newRelationship.fromEntity && newRelationship.toEntity && newRelationship.type) {
      onRelationshipsUpdate([...relationships, newRelationship as Relationship]);
      setNewRelationship({});
      setIsAddingRelationship(false);
    }
  };

  return (
    <>
      {relationships.map((rel, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingRelationshipIndex === index ? (
            <div className="space-y-2">
              <Select
                value={newRelationship.fromEntity || ""}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, fromEntity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="From Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity, idx) => (
                    <SelectItem key={idx} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRelationship.toEntity || ""}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, toEntity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="To Entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity, idx) => (
                    <SelectItem key={idx} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRelationship.type || ""}
                onValueChange={(value) =>
                  setNewRelationship({
                    ...newRelationship,
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
                value={newRelationship.name || ""}
                onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
                placeholder="Relationship name"
              />
              <Input
                value={newRelationship.attributes?.join(", ") || ""}
                onChange={(e) =>
                  setNewRelationship({
                    ...newRelationship,
                    attributes: e.target.value.split(", "),
                  })
                }
                placeholder="Attributes (comma-separated)"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveRelationship}>
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
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditRelationship(index)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteRelationship(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Dialog open={isAddingRelationship} onOpenChange={setIsAddingRelationship}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Relationship</DialogTitle>
            <DialogDescription>Select the entities and enter the relationship details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={newRelationship.fromEntity || ""}
              onValueChange={(value) => setNewRelationship({ ...newRelationship, fromEntity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="From Entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity, idx) => (
                  <SelectItem key={idx} value={entity.name}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newRelationship.toEntity || ""}
              onValueChange={(value) => setNewRelationship({ ...newRelationship, toEntity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="To Entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity, idx) => (
                  <SelectItem key={idx} value={entity.name}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newRelationship.type || ""}
              onValueChange={(value) =>
                setNewRelationship({
                  ...newRelationship,
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
              value={newRelationship.name || ""}
              onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
              placeholder="Relationship name"
            />
            <Input
              value={newRelationship.attributes?.join(", ") || ""}
              onChange={(e) =>
                setNewRelationship({
                  ...newRelationship,
                  attributes: e.target.value.split(", "),
                })
              }
              placeholder="Attributes (comma-separated)"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddRelationship}>Add Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerRelationships;
