import { AnswerMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function AnswerMessageBubble({ message }: { message: AnswerMessage }) {
  return (
    <MessageBubble>
      <p>{message.content}</p>
    </MessageBubble>
  );
}
