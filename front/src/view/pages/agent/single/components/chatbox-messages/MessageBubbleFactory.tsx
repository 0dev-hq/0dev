import { InteractionMessage } from "./messageTypes";
import { TextMessageBubble } from "./TextMessageBubble";
import { PlanMessageBubble } from "./PlanMessageBubble";
import { QuestionMessageBubble } from "./QuestionMessageBubble";
import { OptionsMessageBubble } from "./OptionsMessageBubble";
import { AnswerMessageBubble } from "./AnswerMessageBubble";
import { ConfirmationMessageBubble } from "./ConfirmationMessageBubble";
import { ExecutionMessageBubble } from "./ExecutionMessageBubble";
import { NoneMessageBubble } from "./NoneMessageBubble";
import { ErrorMessageBubble } from "./ErrorMessageBubble";

interface MessageFactoryProps {
  message: InteractionMessage;
  onResponse?: (response: string) => void;
}

export function MessageFactory({ message, onResponse }: MessageFactoryProps) {
  switch (message.type) {
    case "user_input":
    case "text":
      return <TextMessageBubble message={message} />;
    case "plan":
      return <PlanMessageBubble message={message} />;
    case "question":
      return <QuestionMessageBubble message={message} />;
    case "options":
      return <OptionsMessageBubble message={message} />;
    case "answer":
      return <AnswerMessageBubble message={message} />;
    case "confirmation":
      return (
        <ConfirmationMessageBubble message={message} onResponse={onResponse!} />
      );
    case "execution":
      return <ExecutionMessageBubble message={message} />;
    case "none":
      return <NoneMessageBubble message={message} />;
    case "error":
      return <ErrorMessageBubble message={message} />;
    default:
      console.error("Unknown message type:", (message as any).type);
      return null;
  }
}
