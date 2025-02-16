"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobUpdateProps {
  jobId: string;
  status: "running" | "completed" | "failed";
  name: string;
  description: string;
  result?: string;
  error?: string;
}

export function JobUpdate({
  jobId,
  status,
  name,
  description,
  result,
  error,
}: JobUpdateProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm font-medium">Job: {name}</CardTitle>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge
            variant={
              status === "running"
                ? "default"
                : status === "completed"
                ? "success"
                : "destructive"
            }
          >
            {status}
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
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {result && (
            <div className="bg-muted p-2 rounded-md">
              <pre className="text-xs whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-800 p-2 rounded-md mt-2">
              <pre className="text-xs whitespace-pre-wrap">{error}</pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
