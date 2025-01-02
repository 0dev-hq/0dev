import { OptionsMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";

export function OptionsMessageBubble({ message }: { message: OptionsMessage }) {
  return (
    <MessageBubble>
      <div className="space-y-2">
        {message.content.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
          >
            {option}
          </Button>
        ))}
      </div>
    </MessageBubble>
  );
}
