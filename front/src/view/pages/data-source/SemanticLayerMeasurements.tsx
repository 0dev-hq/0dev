import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Measurement } from "@/models/DataSource";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SemanticLayerMeasurementsProps {
  measurements?: Measurement[];
  onMeasurementsUpdate: (updatedMeasurements: Measurement[]) => void;
}

const SemanticLayerMeasurements: React.FC<SemanticLayerMeasurementsProps> = ({
  measurements = [],
  onMeasurementsUpdate,
}) => {
  const [editingMeasurementIndex, setEditingMeasurementIndex] = useState<number | null>(null);
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({});

  const handleEditMeasurement = (index: number) => {
    setEditingMeasurementIndex(index);
    setNewMeasurement(measurements[index]);
  };

  const handleSaveMeasurement = () => {
    if (editingMeasurementIndex !== null) {
      const updatedMeasurements = measurements.map((measurement, idx) =>
        idx === editingMeasurementIndex ? { ...measurement, ...newMeasurement } : measurement
      );
      onMeasurementsUpdate(updatedMeasurements);
      setEditingMeasurementIndex(null);
      setNewMeasurement({});
    }
  };

  const handleDeleteMeasurement = (index: number) => {
    const updatedMeasurements = measurements.filter((_, idx) => idx !== index);
    onMeasurementsUpdate(updatedMeasurements);
  };

  const handleAddMeasurement = () => {
    if (newMeasurement.name && newMeasurement.formula) {
      onMeasurementsUpdate([...measurements, newMeasurement as Measurement]);
      setNewMeasurement({});
      setIsAddingMeasurement(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMeasurementIndex(null);
    setNewMeasurement({});
  };

  return (
    <>
      {measurements.map((measurement, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingMeasurementIndex === index ? (
            <div className="space-y-2">
              <Input
                value={newMeasurement.name || ""}
                onChange={(e) =>
                  setNewMeasurement({ ...newMeasurement, name: e.target.value })
                }
                placeholder="Measurement name"
                className="font-semibold"
              />
              <Textarea
                value={newMeasurement.formula || ""}
                onChange={(e) =>
                  setNewMeasurement({ ...newMeasurement, formula: e.target.value })
                }
                placeholder="Measurement formula"
              />
              <Input
                value={newMeasurement.relatedEntities?.join(", ") || ""}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    relatedEntities: e.target.value.split(", "),
                  })
                }
                placeholder="Related entities (comma-separated)"
              />
              <Textarea
                value={newMeasurement.description || ""}
                onChange={(e) =>
                  setNewMeasurement({ ...newMeasurement, description: e.target.value })
                }
                placeholder="Measurement description"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveMeasurement}>
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
                <span className="font-semibold">{measurement.name}</span> is
                calculated using the formula{" "}
                <span className="font-mono text-sm bg-muted px-1 rounded">
                  {measurement.formula}
                </span>
                {measurement.relatedEntities &&
                  measurement.relatedEntities.length > 0 && (
                    <span>
                      {" "}
                      and is related to the following entities:{" "}
                      {measurement.relatedEntities.join(", ")}
                    </span>
                  )}
                {measurement.description &&
                  ` with the description: ${measurement.description.toLowerCase()}`}
                .
              </p>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditMeasurement(index)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteMeasurement(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Dialog open={isAddingMeasurement} onOpenChange={setIsAddingMeasurement}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Measurement
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Measurement</DialogTitle>
            <DialogDescription>Enter the measurement details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newMeasurement.name || ""}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, name: e.target.value })}
              placeholder="Measurement name"
            />
            <Textarea
              value={newMeasurement.formula || ""}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, formula: e.target.value })}
              placeholder="Measurement formula"
            />
            <Input
              value={newMeasurement.relatedEntities?.join(", ") || ""}
              onChange={(e) =>
                setNewMeasurement({
                  ...newMeasurement,
                  relatedEntities: e.target.value.split(", "),
                })
              }
              placeholder="Related entities (comma-separated)"
            />
            <Textarea
              value={newMeasurement.description || ""}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, description: e.target.value })}
              placeholder="Measurement description"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddMeasurement}>Add Measurement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SemanticLayerMeasurements;
