import { ConfirmationMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";

interface ConfirmationMessageBubbleProps {
  message: ConfirmationMessage;
  onResponse: (response: string) => void;
}

export function ConfirmationMessageBubble({
  message,
  onResponse,
}: ConfirmationMessageBubbleProps) {
  const handleResponse = (answer: "Yes" | "No") => {
    onResponse(`${answer}, I confirm`);
  };

  return (
    <MessageBubble>
      <p className="mb-4">{message.content}</p>
      <div className="flex space-x-2">
        <Button onClick={() => handleResponse("Yes")} variant="default">
          Yes
        </Button>
        <Button onClick={() => handleResponse("No")} variant="outline">
          No
        </Button>
      </div>
    </MessageBubble>
  );
}
