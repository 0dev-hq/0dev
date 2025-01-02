import { PlanMessage } from "./messageTypes";
import { MessageBubble } from "./MessageBubble";
import { CodeMessage } from "./CodeMessage";

export function PlanMessageBubble({ message }: { message: PlanMessage }) {
  return (
    <MessageBubble>
      <CodeMessage
        name={message.plan.name}
        code={message.plan.code}
        language="python"
      />
    </MessageBubble>
  );
}
