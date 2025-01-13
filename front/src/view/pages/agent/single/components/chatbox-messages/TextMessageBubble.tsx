import { TextMessage, UserInputMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";

export function TextMessageBubble({
  message,
}: {
  message: TextMessage | UserInputMessage;
}) {
  return (
    <MessageBubble isSenderUser={message.type === "user_input"}>
      <p>{message.content}</p>
    </MessageBubble>
  );
}
