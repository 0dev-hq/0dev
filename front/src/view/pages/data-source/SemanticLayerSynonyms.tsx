import React, { useState } from "react";
import { Input } from "@/components/ui/input";
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
import { SynonymMapping } from "@/models/DataSource";

interface SemanticLayerSynonymsProps {
  synonyms?: SynonymMapping[];
  onSynonymsUpdate: (updatedSynonyms: SynonymMapping[]) => void;
}

const SemanticLayerSynonyms: React.FC<SemanticLayerSynonymsProps> = ({
  synonyms = [],
  onSynonymsUpdate,
}) => {
  const [editingSynonymIndex, setEditingSynonymIndex] = useState<number | null>(null);
  const [isAddingSynonym, setIsAddingSynonym] = useState(false);
  const [newSynonym, setNewSynonym] = useState<Partial<SynonymMapping>>({});

  const handleEditSynonym = (index: number) => {
    setEditingSynonymIndex(index);
    setNewSynonym(synonyms[index]);
  };

  const handleSaveSynonym = () => {
    if (editingSynonymIndex !== null) {
      const updatedSynonyms = synonyms.map((mapping, idx) =>
        idx === editingSynonymIndex ? { ...mapping, ...newSynonym } : mapping
      );
      onSynonymsUpdate(updatedSynonyms);
      setEditingSynonymIndex(null);
      setNewSynonym({});
    }
  };

  const handleDeleteSynonym = (index: number) => {
    const updatedSynonyms = synonyms.filter((_, idx) => idx !== index);
    onSynonymsUpdate(updatedSynonyms);
  };

  const handleAddSynonym = () => {
    if (newSynonym.name && newSynonym.synonyms) {
      onSynonymsUpdate([...synonyms, newSynonym as SynonymMapping]);
      setNewSynonym({});
      setIsAddingSynonym(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSynonymIndex(null);
    setNewSynonym({});
  };

  return (
    <>
      {synonyms.map((mapping, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingSynonymIndex === index ? (
            <div className="space-y-2">
              <Input
                value={newSynonym.name || ""}
                onChange={(e) =>
                  setNewSynonym({ ...newSynonym, name: e.target.value })
                }
                placeholder="Synonym name"
                className="font-semibold"
              />
              <Input
                value={newSynonym.synonyms?.join(", ") || ""}
                onChange={(e) =>
                  setNewSynonym({
                    ...newSynonym,
                    synonyms: e.target.value.split(", "),
                  })
                }
                placeholder="Synonyms (comma-separated)"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveSynonym}>
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
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditSynonym(index)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteSynonym(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Dialog open={isAddingSynonym} onOpenChange={setIsAddingSynonym}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Synonym
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Synonym</DialogTitle>
            <DialogDescription>Enter the synonym details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newSynonym.name || ""}
              onChange={(e) => setNewSynonym({ ...newSynonym, name: e.target.value })}
              placeholder="Synonym name"
            />
            <Input
              value={newSynonym.synonyms?.join(", ") || ""}
              onChange={(e) =>
                setNewSynonym({
                  ...newSynonym,
                  synonyms: e.target.value.split(", "),
                })
              }
              placeholder="Synonyms (comma-separated)"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddSynonym}>Add Synonym</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerSynonyms;
