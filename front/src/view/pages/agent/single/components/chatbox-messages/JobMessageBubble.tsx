import { JobMessage } from "./messageTypes";
import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function JobMessageBubble({ message }: { message: JobMessage }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (message.content.status) {
      case "in_progress":
      case "created":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="mb-4  w-3/4">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm font-medium">
          Job: {message.content.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge
            variant={
              message.content.status === "in_progress" ||
              message.content.status === "created"
                ? "default"
                : message.content.status === "completed"
                ? "success"
                : "destructive"
            }
          >
            {message.content.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            {message.content.description}
          </p>
          {message.content.status === "completed" && (
            <div className="bg-muted p-2 rounded-md">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(message.content.payload)}
              </pre>
            </div>
          )}
          {message.content.status === "failed" && (
            <div className="bg-red-100 text-red-800 p-2 rounded-md mt-2">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(message.content.payload)}
              </pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
