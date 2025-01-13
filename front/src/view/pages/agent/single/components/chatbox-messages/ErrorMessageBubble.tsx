import { ErrorMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function ErrorMessageBubble({ message }: { message: ErrorMessage }) {
  return (
    <MessageBubble>
      <p className="text-red-500 font-bold">Error:</p>
      <p>{message.content}</p>
    </MessageBubble>
  );
}
