import { GenerativeAIProvider } from "../generative-ai-providers/generativeAIProvider";
import { SemanticLayer } from "./semanticLayer";

export type DataSourceSchema = Record<
  string,
  { column: string; type: string }[]
>;

export abstract class SemanticLayerGenerator {
  protected aiProvider: GenerativeAIProvider;

  constructor(aiProvider: GenerativeAIProvider) {
    this.aiProvider = aiProvider;
  }
  abstract generateSemanticLayer(
    schema: DataSourceSchema
  ): Promise<SemanticLayer>;
}
