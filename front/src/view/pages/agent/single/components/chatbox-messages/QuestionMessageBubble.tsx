import { QuestionMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function QuestionMessageBubble({
  message,
}: {
  message: QuestionMessage;
}) {
  return (
    <MessageBubble>
      <p>{message.content}</p>
    </MessageBubble>
  );
}
