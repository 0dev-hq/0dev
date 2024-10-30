import React from "react";
import { useState } from "react";
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
import { DataSource } from "@/models/DataSource";

interface SemanticLayerProps {
  dataSource: DataSource;
}


const SemanticLayer: React.FC<SemanticLayerProps> = ({ dataSource }) => {
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
                  Entities: <SemanticLayerEntities entities={dataSource.analysisInfo?.semanticLayer?.entities} />,
                  Attributes: <SemanticLayerAttributes entityAttributes={dataSource.analysisInfo?.semanticLayer?.entityAttributes} />,
                  Relationships: <SemanticLayerRelationships entities={dataSource.analysisInfo?.semanticLayer?.entities} relationships={dataSource.analysisInfo?.semanticLayer?.relationships} />,
                  Measurements: <SemanticLayerMeasurements measurements={dataSource.analysisInfo?.semanticLayer?.measurements} />,
                  Definitions: <SemanticLayerDefinitions definitions={dataSource.analysisInfo?.semanticLayer?.definitions} />,
                  Synonyms: <SemanticLayerSynonyms synonyms={dataSource.analysisInfo?.semanticLayer?.synonyms} />,
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
