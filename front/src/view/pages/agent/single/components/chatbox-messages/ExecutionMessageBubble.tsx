import { ExecutionMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function ExecutionMessageBubble({
  message,
}: {
  message: ExecutionMessage;
}) {
  return (
    <MessageBubble>
      <p>{message.status}</p>
    </MessageBubble>
  );
}
