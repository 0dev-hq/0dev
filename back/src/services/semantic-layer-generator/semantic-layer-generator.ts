import { GenerativeAIProvider } from "../generative-ai-providers/generative-ai-provider";
import { SemanticLayer } from "../../models/semantic-layer";

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
