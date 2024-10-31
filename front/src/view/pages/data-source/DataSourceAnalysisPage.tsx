import { useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SemanticLayer from "./SemanticLayer";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  analyze,
  getDataSourceAnalysis,
  updateDataSourceAnalysis,
} from "@/services/dataSourceService";
import {
  AnalysisInfo,
  DataSource,
  SemanticLayer as SL,
} from "@/models/DataSource";
export default function DataSourceAnalysisPage() {
  const [activeTab, setActiveTab] = useState("semanticLayer");
  const { id } = useParams();

  // Fetch data source analysis info
  const {
    data: dataSource,
    isLoading,
    isError,
  } = useQuery<DataSource>("dataSourceAnalysis", () =>
    getDataSourceAnalysis(id!)
  );

  const queryClient = useQueryClient();

  const { mutate: captureSchema, isLoading: isAnalyzing } = useMutation(
    () => analyze(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("dataSourceAnalysis"); // Refetch data sources after capturing schema
      },
      onError: (error) => {
        console.error("Error capturing schema:", error);
      },
    }
  );

  const { mutate: reviseAnalysis, isLoading: isUpdating } = useMutation(
    (analysisInfo: AnalysisInfo) => updateDataSourceAnalysis(id!, analysisInfo),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("dataSourceAnalysis"); // Refetch data sources after capturing schema
      },
      onError: (error) => {
        console.error("Error capturing schema:", error);
      },
    }
  );

  const handleReviseAnalysis = (semanticLayer: SL) => {
    const updatedAnalysisInfo = {
      ...dataSource!.analysisInfo,
      semanticLayer,
    };
    reviseAnalysis(updatedAnalysisInfo);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error fetching data source analysis</p>;
  }

  if (!dataSource) {
    return <p>Data source not found</p>;
  }

  if (isAnalyzing) {
    return <p>Analyzing the data source...</p>;
  }

  // todo: this is too intrusive, we should have a better way to handle this
  if (isUpdating) {
    return <p>Updating the data source...</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{dataSource.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {dataSource.lastTimeAnalyzed ? (
            <p className="text-sm text-muted-foreground">
              Last analyzed:{" "}
              {new Date(dataSource.lastTimeAnalyzed).toLocaleString()}
            </p>
          ) : (
            <div className="flex items-center text-yellow-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <p className="text-sm">Not yet analyzed</p>
            </div>
          )}
          <Button onClick={() => captureSchema()} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {!dataSource.lastTimeAnalyzed ? (
        <Card>
          <CardHeader>
            <CardTitle>No Analysis Data Available</CardTitle>
            <CardDescription>
              This data source hasn't been analyzed yet. Run an analysis to view
              insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => captureSchema()}>Run Analysis</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="semanticLayer">Semantic Layer</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="erd">ERD</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semanticLayer" className="space-y-4">
            <SemanticLayer
              dataSource={dataSource}
              onSemanticLayerUpdate={handleReviseAnalysis}
            />
          </TabsContent>

          <TabsContent value="erd" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entity Relationship Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
