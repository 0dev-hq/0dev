import React from "react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SynonymMapping } from "@/models/DataSource";

interface SemanticLayerSynonymsProps {
  synonyms?: SynonymMapping[];
}

const SemanticLayerSynonyms: React.FC<SemanticLayerSynonymsProps> = ({ synonyms = [] }) => {
  const [editingSynonymIndex, setEditingSynonymIndex] = useState<number | null>(
    null
  );

  const handleEditSynonym = (index: number) => {
    setEditingSynonymIndex(index);
  };

  const handleSaveSynonym = (
    index: number,
    updatedSynonym: Partial<SynonymMapping>
  ) => {
    setEditingSynonymIndex(null);
  };


  const handleCancelEdit = () => {
    setEditingSynonymIndex(null);
  };

  return (
    <>
      {synonyms.map((mapping, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingSynonymIndex === index ? (
            <div className="space-y-2">
              <Input
                value={mapping.name}
                onChange={(e) =>
                  handleSaveSynonym(index, { name: e.target.value })
                }
                placeholder="Synonym name"
                className="font-semibold"
              />
              <Input
                value={mapping.synonyms.join(", ")}
                onChange={(e) =>
                  handleSaveSynonym(index, {
                    synonyms: e.target.value.split(", "),
                  })
                }
                placeholder="Synonyms (comma-separated)"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleSaveSynonym(index, {})}>
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
                <span className="font-semibold">{mapping.name}</span> can also
                be referred to as {mapping.synonyms.join(", ")}.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditSynonym(index)}
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

export default SemanticLayerSynonyms;
