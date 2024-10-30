import React from "react";
import { useState } from "react";
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
import { Edit2, Check, X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attribute, EntityAttribute } from "@/models/DataSource";


type SemanticLayerAttributesProps = {
  entityAttributes?: EntityAttribute[];
};

const SemanticLayerAttributes: React.FC<SemanticLayerAttributesProps> = ({ entityAttributes = [] }) => {
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null
  );
  const [expandedEntities, setExpandedEntities] = useState<string[]>([]);

 

  const handleCancelEdit = () => {
    setEditingAttributeId(null);
  };

  const handleEditAttribute = (id: string) => {
    setEditingAttributeId(id);
  };

  const handleSaveAttribute = (
    entityName: string,
    attributeId: string,
    updatedAttribute: Partial<Attribute>
  ) => {
    // setEntityAttributes(
    //   entityAttributes.map((ea) =>
    //     ea.entity === entityName
    //       ? {
    //           ...ea,
    //           attributes: ea.attributes.map((attr) =>
    //             attr._id === attributeId
    //               ? { ...attr, ...updatedAttribute }
    //               : attr
    //           ),
    //         }
    //       : ea
    //   )
    // );
    setEditingAttributeId(null);
  };

  const toggleEntityExpansion = (entityName: string) => {
    setExpandedEntities((prev) =>
      prev.includes(entityName)
        ? prev.filter((e) => e !== entityName)
        : [...prev, entityName]
    );
  };
  return (
    <>
        {entityAttributes.map((ea) => (
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
                {ea.attributes.map((attr) => (
                  <div key={attr._id} className="pl-6 border-l-2 border-muted">
                    {editingAttributeId === attr._id ? (
                      <div className="space-y-2">
                        <Input
                          value={attr.name}
                          onChange={(e) =>
                            handleSaveAttribute(ea.entity, attr._id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Attribute name"
                          className="font-semibold"
                        />
                        <Select
                          value={attr.type}
                          onValueChange={(value) =>
                            handleSaveAttribute(ea.entity, attr._id, {
                              type: value as Attribute["type"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identifier">
                              Identifier
                            </SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={attr.description}
                          onChange={(e) =>
                            handleSaveAttribute(ea.entity, attr._id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Attribute description"
                        />
                        <Input
                          value={attr.aliases?.join(", ")}
                          onChange={(e) =>
                            handleSaveAttribute(ea.entity, attr._id, {
                              aliases: e.target.value.split(", "),
                            })
                          }
                          placeholder="Aliases (comma-separated)"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSaveAttribute(ea.entity, attr._id, {})
                            }
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>
                          <span className="font-semibold">{attr.name}</span> is
                          a{" "}
                          <span className="font-mono text-sm bg-muted px-1 rounded">
                            {attr.type}
                          </span>{" "}
                          attribute
                          {attr.description &&
                            ` that ${attr.description.toLowerCase()}`}
                          {attr.aliases && attr.aliases.length > 0 && (
                            <span>
                              . It can also be referred to as{" "}
                              {attr.aliases.join(", ")}
                            </span>
                          )}
                          .
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAttribute(attr._id)}
                          className="mt-2"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </>
  );
};

export default SemanticLayerAttributes;
