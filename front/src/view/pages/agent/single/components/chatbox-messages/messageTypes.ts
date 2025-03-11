type MessageBase<T extends string> = { type: T };

type MessageContent<T> = T extends "text"
  ? { content: string }
  : T extends "plan"
  ? {
      content: {
        name: string;
        code: string;
        requirements: string;
        reference_id: string;
      };
    }
  : T extends "question" | "answer" | "user_input"
  ? { content: string }
  : T extends "confirmation"
  ? {
      content: {
        reference_id: string;
        version: string;
        input?: object;
      };
    }
  : T extends "options"
  ? { content: string[] }
  : T extends "execution"
  ? { content: string }
  : T extends "none" | "error"
  ? { content: string }
  : T extends "job"
  ? {
      content: {
        name: string;
        description: string;
        job_id: string;
        status: "created" | "in_progress" | "completed" | "failed";
        payload: object;
      };
    }
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
export type JobMessage = Message<"job">;

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
  | ErrorMessage
  | JobMessage;
