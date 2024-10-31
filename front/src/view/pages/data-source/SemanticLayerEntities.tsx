import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entity } from "@/models/DataSource";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type SemanticLayerEntitiesProps = {
  entities?: Entity[];
  onEntityUpdate: (updatedEntities: Entity[]) => void;
};

const SemanticLayerEntities: React.FC<SemanticLayerEntitiesProps> = ({
  entities = [],
  onEntityUpdate,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [newEntity, setNewEntity] = useState<Partial<Entity>>({});
  const { control, handleSubmit, reset } = useForm<Entity>({
    defaultValues: entities[editingIndex || 0],
  });

  const handleEditEntity = (index: number) => {
    setEditingIndex(index);
    reset(entities[index]); // Reset form values to the selected entity's data
  };

  const handleDeleteEntity = (index: number) => {
    const updatedEntities = entities.filter((_, idx) => idx !== index);
    onEntityUpdate(updatedEntities);
  };

  const handleSaveEntity = (data: Entity) => {
    if (editingIndex !== null) {
      const updatedEntities = entities.map((entity, idx) =>
        idx === editingIndex ? { ...entity, ...data } : entity
      );
      onEntityUpdate(updatedEntities);
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset(); // Clear form values
  };

  const handleAddEntity = () => {
    if (newEntity.name && newEntity.table) {
      const updatedEntities = [...entities, newEntity as Entity];
      onEntityUpdate(updatedEntities);
      setNewEntity({});
      setIsAddingEntity(false);
    }
  };

  return (
    <>
      {entities.map((entity, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingIndex === index ? (
            <form
              onSubmit={handleSubmit(handleSaveEntity)}
              className="space-y-2"
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Entity name"
                    className="font-semibold"
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Entity description" />
                )}
              />
              <Controller
                name="synonyms"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Synonyms (comma-separated)"
                    onChange={(e) => field.onChange(e.target.value.split(", "))}
                  />
                )}
              />
              <div className="flex space-x-2">
                <Button size="sm" type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <p>
                <span className="font-semibold">{entity.name}</span> is a
                business entity that represents {entity.description.toLowerCase()}. It is mapped to the
                <span className="font-mono text-sm bg-muted px-1 rounded">
                  {entity.table}
                </span>
                table in the database
                {entity.synonyms && entity.synonyms.length > 0 && (
                  <span>
                    {" "}and can also be referred to as {entity.synonyms.join(", ")}.
                  </span>
                )}
                .
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditEntity(index)}
                className="mt-2"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteEntity(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={isAddingEntity} onOpenChange={setIsAddingEntity}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Entity</DialogTitle>
            <DialogDescription>
              Enter the details for the new entity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityName">Entity Name</Label>
              <Input
                id="entityName"
                value={newEntity.name || ""}
                onChange={(e) =>
                  setNewEntity({ ...newEntity, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityTable">Table Name</Label>
              <Input
                id="entityTable"
                value={newEntity.table || ""}
                onChange={(e) =>
                  setNewEntity({ ...newEntity, table: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityDescription">Description</Label>
              <Textarea
                id="entityDescription"
                value={newEntity.description || ""}
                onChange={(e) =>
                  setNewEntity({ ...newEntity, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entitySynonyms">Synonyms (comma-separated)</Label>
              <Input
                id="entitySynonyms"
                value={newEntity.synonyms?.join(", ") || ""}
                onChange={(e) =>
                  setNewEntity({
                    ...newEntity,
                    synonyms: e.target.value.split(", "),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEntity}>Add Entity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerEntities;
