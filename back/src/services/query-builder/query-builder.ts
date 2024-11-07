import { GenerativeAIProvider } from "../generative-ai-providers/generativeAIProvider";

export type DataSourceSchema = Record<
  string,
  { column: string; type: string }[]
>;

export abstract class QueryBuilder {
  protected aiProvider: GenerativeAIProvider;

  constructor(aiProvider: GenerativeAIProvider) {
    this.aiProvider = aiProvider;
  }
  abstract generateQuery(description: string, analysisInfo: any): Promise<any>;
}
