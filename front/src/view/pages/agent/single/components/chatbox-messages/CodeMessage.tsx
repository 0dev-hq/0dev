"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Editor from "@monaco-editor/react";

interface CodeMessageProps {
  name: string;
  code: string;
  language?: string;
}

export function CodeMessage({
  name,
  code,
  language = "javascript",
}: CodeMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card
      className={`w-full transition-all duration-300 ease-in-out ${
        isExpanded ? "fixed inset-0 z-50" : "max-w-2xl"
      }`}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${isExpanded ? "h-[calc(100vh-200px)]" : "h-64"}`}>
          <Editor
            height="100%"
            defaultLanguage={language}
            defaultValue={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Language: {language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        <Button variant="outline" onClick={toggleExpand}>
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Minimize
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> Expand
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
