

import { useState } from "react";
import { ConfirmationMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfirmationMessageBubbleProps {
  message: ConfirmationMessage;
  onResponse: (response: string) => void;
}

export function ConfirmationMessageBubble({
  message,
  onResponse,
}: ConfirmationMessageBubbleProps) {
  const [response, setResponse] = useState<string | null>(null);

  const handleResponse = (answer: "Yes" | "No") => {
    setResponse(answer);
    onResponse(answer);
  };

  return (
    <MessageBubble>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Confirmation Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Please confirm the execution of the plan with the following details:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Reference ID: {message.content.reference_id}</li>
            <li>Version: {message.content.version}</li>
            {message.content.input && (
              <li>
                Input:
                <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-x-auto">
                  {JSON.stringify(message.content.input, null, 2)}
                </pre>
              </li>
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {!response ? (
            <>
              <Button onClick={() => handleResponse("No")} variant="outline">
                No
              </Button>
              <Button onClick={() => handleResponse("Yes")} variant="default">
                Yes
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You responded: {response}
            </p>
          )}
        </CardFooter>
      </Card>
    </MessageBubble>
  );
}
