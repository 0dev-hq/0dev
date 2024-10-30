import React from "react";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Measurement } from "@/models/DataSource";

interface SemanticLayerMeasurementsProps {
  measurements?: Measurement[];
}

const SemanticLayerMeasurements: React.FC<SemanticLayerMeasurementsProps> = ({ measurements = [] }) => {
  const [editingMeasurementIndex, setEditingMeasurementIndex] = useState<
    number | null
  >(null);

  const handleEditMeasurement = (index: number) => {
    setEditingMeasurementIndex(index);
  };

  const handleSaveMeasurement = (
    index: number,
    updatedMeasurement: Partial<Measurement>
  ) => {

    setEditingMeasurementIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingMeasurementIndex(null);
  };

  return (
    <>
      {measurements.map((measurement, index) => (
        <div key={index} className="p-4 border rounded-lg">
          {editingMeasurementIndex === index ? (
            <div className="space-y-2">
              <Input
                value={measurement.name}
                onChange={(e) =>
                  handleSaveMeasurement(index, {
                    name: e.target.value,
                  })
                }
                placeholder="Measurement name"
                className="font-semibold"
              />
              <Textarea
                value={measurement.formula}
                onChange={(e) =>
                  handleSaveMeasurement(index, {
                    formula: e.target.value,
                  })
                }
                placeholder="Measurement formula"
              />
              <Input
                value={measurement.relatedEntities.join(", ")}
                onChange={(e) =>
                  handleSaveMeasurement(index, {
                    relatedEntities: e.target.value.split(", "),
                  })
                }
                placeholder="Related entities (comma-separated)"
              />
              <Textarea
                value={measurement.description}
                onChange={(e) =>
                  handleSaveMeasurement(index, {
                    description: e.target.value,
                  })
                }
                placeholder="Measurement description"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveMeasurement(index, {})}
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditMeasurement(index)}
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

export default SemanticLayerMeasurements;
