type MessageBase<T extends string> = { type: T };

type MessageContent<T> = T extends "text"
  ? { content: string }
  : T extends "plan"
  ? {
      plan: {
        name: string;
        code: string;
        requirements: string;
        reference_id: string;
      };
    }
  : T extends "question" | "answer" | "confirmation" | "user_input"
  ? { content: string }
  : T extends "options"
  ? { content: string[] }
  : T extends "execution"
  ? { status: string }
  : T extends "none" | "error"
  ? { message: string }
  : never;

type Message<T extends string> = MessageBase<T> & MessageContent<T>;

export type UserInputMessage = Message<"user_input">;
export type TextMessage = Message<"text">;
export type PlanMessage = Message<"plan">;
export type QuestionMessage = Message<"question">;
export type OptionsMessage = Message<"options">;
export type AnswerMessage = Message<"answer">;
export type ConfirmationMessage = Message<"confirmation">;
export type ExecutionMessage = Message<"execution">;
export type NoneMessage = Message<"none">;
export type ErrorMessage = Message<"error">;

export type InteractionMessage =
  | UserInputMessage
  | TextMessage
  | PlanMessage
  | QuestionMessage
  | OptionsMessage
  | AnswerMessage
  | ConfirmationMessage
  | ExecutionMessage
  | NoneMessage
  | ErrorMessage;
