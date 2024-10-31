import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attribute, EntityAttribute } from "@/models/DataSource";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type SemanticLayerAttributesProps = {
  entityAttributes?: EntityAttribute[];
  onAttributesUpdate: (entityAttributes: EntityAttribute[]) => void;
};

const SemanticLayerAttributes: React.FC<SemanticLayerAttributesProps> = ({
  entityAttributes = [],
  onAttributesUpdate,
}) => {
  const [editingEntityIndex, setEditingEntityIndex] = useState<number | null>(null);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);
  const [expandedEntities, setExpandedEntities] = useState<string[]>([]);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState<Partial<Attribute & { entity: string }>>({});
  const { control, handleSubmit, reset } = useForm<Attribute>();

  const handleCancelEdit = () => {
    setEditingEntityIndex(null);
    setEditingAttributeIndex(null);
    reset(); // Clear form values
  };

  const handleEditAttribute = (entityIndex: number, attrIndex: number) => {
    setEditingEntityIndex(entityIndex);
    setEditingAttributeIndex(attrIndex);
    const attributeToEdit = entityAttributes[entityIndex].attributes[attrIndex];
    if (attributeToEdit) {
      reset(attributeToEdit); // Reset form with current attribute values
    }
  };

  const handleDeleteAttribute = (entityIndex: number, attrIndex: number) => {
    const updatedAttributes = entityAttributes.map((ea, eaIndex) => ({
      ...ea,
      attributes: eaIndex === entityIndex
        ? ea.attributes.filter((_, idx) => idx !== attrIndex)
        : ea.attributes,
    }));
    onAttributesUpdate(updatedAttributes);
  };

  const handleSaveAttribute = (data: Attribute) => {
    if (editingEntityIndex !== null && editingAttributeIndex !== null) {
      const updatedAttributes = entityAttributes.map((ea, eaIndex) => ({
        ...ea,
        attributes: ea.attributes.map((attr, attrIndex) =>
          eaIndex === editingEntityIndex && attrIndex === editingAttributeIndex
            ? { ...attr, ...data }
            : attr
        ),
      }));
      onAttributesUpdate(updatedAttributes);
      setEditingEntityIndex(null);
      setEditingAttributeIndex(null);
    }
  };

  const handleAddAttribute = () => {
    if (newAttribute.name && newAttribute.type && newAttribute.entity) {
      const updatedAttributes = [...entityAttributes];
      const entity = updatedAttributes.find((ea) => ea.entity === newAttribute.entity);
      if (entity) entity.attributes.push(newAttribute as Attribute);
      onAttributesUpdate(updatedAttributes);
      setNewAttribute({});
      setIsAddingAttribute(false);
    }
  };

  const toggleEntityExpansion = (entityName: string) => {
    setExpandedEntities((prev) =>
      prev.includes(entityName) ? prev.filter((e) => e !== entityName) : [...prev, entityName]
    );
  };

  return (
    <>
      {entityAttributes.map((ea, entityIndex) => (
        <div key={ea.entity} className="border rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-start p-4"
            onClick={() => toggleEntityExpansion(ea.entity)}
          >
            {expandedEntities.includes(ea.entity) ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            {ea.entity}
          </Button>
          {expandedEntities.includes(ea.entity) && (
            <div className="p-4 pt-0 space-y-4">
              {ea.attributes.map((attr, attrIndex) => (
                <div key={attrIndex} className="pl-6 border-l-2 border-muted">
                  {editingEntityIndex === entityIndex && editingAttributeIndex === attrIndex ? (
                    <form onSubmit={handleSubmit(handleSaveAttribute)} className="space-y-2">
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Attribute name" className="font-semibold" />
                        )}
                      />
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="identifier">Identifier</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="currency">Currency</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Attribute description" />
                        )}
                      />
                      <Controller
                        name="aliases"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Aliases (comma-separated)"
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
                        <span className="font-semibold">{attr.name}</span> is a{" "}
                        <span className="font-mono text-sm bg-muted px-1 rounded">
                          {attr.type}
                        </span>{" "}
                        attribute
                        {attr.description && ` that ${attr.description.toLowerCase()}`}
                        {attr.aliases && attr.aliases.length > 0 && (
                          <span>. It can also be referred to as {attr.aliases.join(", ")}</span>
                        )}
                        .
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAttribute(entityIndex, attrIndex)}
                        className="mt-2"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAttribute(entityIndex, attrIndex)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Dialog open={isAddingAttribute} onOpenChange={setIsAddingAttribute}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Attribute</DialogTitle>
            <DialogDescription>Select the entity and enter the attribute details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entitySelect">Select Entity</Label>
              <Select
                value={newAttribute.entity || ""}
                onValueChange={(value) => setNewAttribute({ ...newAttribute, entity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose entity" />
                </SelectTrigger>
                <SelectContent>
                  {entityAttributes.map((ea) => (
                    <SelectItem key={ea.entity} value={ea.entity}>
                      {ea.entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attributeName">Attribute Name</Label>
              <Input
                id="attributeName"
                value={newAttribute.name || ""}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attributeType">Type</Label>
              <Select
                value={newAttribute.type || ""}
                onValueChange={(value) =>
                  setNewAttribute({ ...newAttribute, type: value as Attribute["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identifier">Identifier</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attributeDescription">Description</Label>
              <Textarea
                id="attributeDescription"
                value={newAttribute.description || ""}
                onChange={(e) =>
                  setNewAttribute({
                    ...newAttribute,
                    description: e.target.value,
                  })
                }
                placeholder="Attribute description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attributeAliases">Aliases (comma-separated)</Label>
              <Input
                id="attributeAliases"
                value={newAttribute.aliases?.join(", ") || ""}
                onChange={(e) =>
                  setNewAttribute({
                    ...newAttribute,
                    aliases: e.target.value.split(", "),
                  })
                }
                placeholder="Aliases"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAttribute}>Add Attribute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerAttributes;

