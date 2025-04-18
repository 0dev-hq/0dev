import { NoneMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function NoneMessageBubble({ message }: { message: NoneMessage }) {
  return (
    <MessageBubble>
      <p>{message.content}</p>
    </MessageBubble>
  );
}
