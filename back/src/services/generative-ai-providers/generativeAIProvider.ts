export type Prompt = {
  role: "system" | "user";
  content: string;
}[];

export type AIModel =
  | { provider: "openai"; modelName: "gpt-4o-mini" | "gpt-4o" }
  | { provider: "anthropic"; modelName: "claude-1" | "claude-2" }; // Not implemented yet

export type GenerativeAIOutputFormat =
  | "string"
  | "javascript"
  | "json"
  | "file";

export type GenerativeAIResponse<T> = T extends "javascript"
  ? string
  : T extends "json"
  ? object
  : T extends "file"
  ? File
  : T extends "string"
  ? string
  : never;

export abstract class GenerativeAIProvider {
  protected modelName: string;

  constructor(aiModel: AIModel) {
    this.modelName = aiModel.modelName;
  }

  abstract generateResponse<T extends GenerativeAIOutputFormat>(
    prompt: Prompt,
    format: T
  ): Promise<GenerativeAIResponse<T>>;
}
