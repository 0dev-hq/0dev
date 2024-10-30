import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SemanticLayerEntities from "./SemanticLayerEntities";
import SemanticLayerAttributes from "./SemanticLayerAttributes";
import SemanticLayerRelationships from "./SemanticLayerRelationships";
import SemanticLayerMeasurements from "./SemanticLayerMeasurements";
import SemanticLayerDefinitions from "./SemanticLayerDefinitions";
import SemanticLayerSynonyms from "./SemanticLayerSynonyms";
import SwitchCase from "@/components/ui/SwitchCase";
import { DataSource, Entity, SemanticLayer as SL } from "@/models/DataSource";

interface SemanticLayerProps {
  dataSource: DataSource;
  onSemanticLayerUpdate: (semanticLayer: SL) => void;
}

const SemanticLayer: React.FC<SemanticLayerProps> = ({
  dataSource,
  onSemanticLayerUpdate,
}) => {
  const semanticLayerSections = [
    "Entities",
    "Attributes",
    "Relationships",
    "Measurements",
    "Definitions",
    "Synonyms",
  ];

  const [activeSidebarItem, setActiveSidebarItem] = useState(
    semanticLayerSections[0]
  );

  const handleSemanticLayerChange = <K extends keyof SL>(
    propertyKey: K,
    updatedValue: SL[K]
  ) => {
    if (dataSource.analysisInfo?.semanticLayer) {
      const updatedSemanticLayer = {
        ...dataSource.analysisInfo.semanticLayer,
        [propertyKey]: updatedValue,
      };
      onSemanticLayerUpdate(updatedSemanticLayer);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Sidebar */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Semantic Layer</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {semanticLayerSections.map((section) => (
                <Button
                  key={section}
                  variant={
                    activeSidebarItem === section ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveSidebarItem(section)}
                >
                  {section}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main content area */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{activeSidebarItem}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4">
              <SwitchCase
                value={activeSidebarItem}
                cases={{
                  Entities: (
                    <SemanticLayerEntities
                      entities={
                        dataSource.analysisInfo?.semanticLayer?.entities
                      }
                      onEntityUpdate={(updatedEntities: Entity[]) =>
                        handleSemanticLayerChange("entities", updatedEntities)
                      }
                    />
                  ),
                  Attributes: (
                    <SemanticLayerAttributes
                      entityAttributes={
                        dataSource.analysisInfo?.semanticLayer?.entityAttributes
                      }
                    />
                  ),
                  Relationships: (
                    <SemanticLayerRelationships
                      entities={
                        dataSource.analysisInfo?.semanticLayer?.entities
                      }
                      relationships={
                        dataSource.analysisInfo?.semanticLayer?.relationships
                      }
                      onRelationshipsUpdate={(updatedRelationships) =>
                        handlePropertyChange("relationships", updatedRelationships)
                      }
                    />
                  ),
                  Measurements: (
                    <SemanticLayerMeasurements
                      measurements={
                        dataSource.analysisInfo?.semanticLayer?.measurements
                      }
                      onMeasurementsUpdate={(updatedMeasurements) =>
                        handlePropertyChange("measurements", updatedMeasurements)
                      }
                    />
                  ),
                  Definitions: (
                    <SemanticLayerDefinitions
                      definitions={
                        dataSource.analysisInfo?.semanticLayer?.definitions
                      }
                      onDefinitionsUpdate={(updatedDefinitions) =>
                        handlePropertyChange("definitions", updatedDefinitions)
                      }
                    />
                  ),
                  Synonyms: (
                    <SemanticLayerSynonyms
                      synonyms={
                        dataSource.analysisInfo?.semanticLayer?.synonyms
                      }
                      onSynonymsUpdate={(updatedSynonyms) =>
                        handlePropertyChange("synonyms", updatedSynonyms)
                      }
                    />
                  ),
                }}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SemanticLayer;
