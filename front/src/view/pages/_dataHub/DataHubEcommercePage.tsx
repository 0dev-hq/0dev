import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Database, Users, BarChart, Lightbulb, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

// Dummy data for charts
const salesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Total Sales ($)",
      data: [3000, 4000, 3200, 5000, 6200, 7000],
      fill: false,
      backgroundColor: "rgba(75,192,192,1)",
      borderColor: "rgba(75,192,192,1)",
    },
  ],
};

const connectedSources = [
  { name: "Shopify", icon: <Database className="w-6 h-6 text-blue-600" /> },
  { name: "Facebook", icon: <Users className="w-6 h-6 text-blue-600" /> },
  {
    name: "Google Analytics",
    icon: <BarChart className="w-6 h-6 text-blue-600" />,
  },
];

const insights = [
  "We've noticed a 15% increase in customer engagement through email campaigns.",
  "Your Shopify store's conversion rate improved by 2.3% with a new recommendation engine.",
  "There's been a 5% increase in mobile traffic to your website over the past month.",
];

const DataHubEcommercePage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([
    "Hello! How can I help you with your data insights today?",
  ]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatLog([
        ...chatLog,
        inputMessage,
        "Here's an automated response to your inquiry.",
      ]);
      setInputMessage("");
    }
  };

  const [hubConfig, setHubConfig] = useState({
    name: "Data Hub",
    description: "A centralized platform for all your data sources.",
  });
  
  const handleConfigSave = () => {
    // Simulate saving the configuration (In a real app, this might make an API call)
    console.log("Hub Configuration saved:", hubConfig);
    alert("Configuration saved successfully!");
  };

  return (
    <div className="p-6 ">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="hub-config">Hub Config</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Total Data Sources</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">573</p>
              <p className="text-xs text-muted-foreground">
                +201 since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Data Processed</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1.2 TB</p>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Insights Generated</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">342</p>
              <p className="text-xs text-muted-foreground">
                +42 from last week
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={salesData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Key findings from your data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4 space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded shadow">
                    <p>{insight}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>Ask questions about your data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4 space-y-4">
                {chatLog.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      index % 2 === 0 ? "bg-gray-200" : "bg-blue-100"
                    }`}
                  >
                    {msg}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="hub-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hub Configuration</CardTitle>
              <CardDescription>
                Manage settings for {hubConfig.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hub-name">Hub Name</Label>
                  <Input
                    id="hub-name"
                    value={hubConfig.name}
                    onChange={(e) =>
                      setHubConfig({ ...hubConfig, name: e.target.value })
                    }
                    placeholder="Enter Hub Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hub-description">Description</Label>
                  <Textarea
                    id="hub-description"
                    value={hubConfig.description}
                    onChange={(e) =>
                      setHubConfig({
                        ...hubConfig,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter Hub Description"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="pt-4">
              <Button onClick={handleConfigSave}>
                <Save className="mr-2 h-4 w-4" /> Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataHubEcommercePage;

