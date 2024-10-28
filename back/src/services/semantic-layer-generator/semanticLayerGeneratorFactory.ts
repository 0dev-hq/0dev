import { DataSourceType } from "../../models/DataSource";
import { GenerativeAIProvider } from "../generative-ai-providers/generativeAIProvider";
import { MongoDBSemanticLayerGenerator } from "./mongoDBSemanticLayerGenerator";
import { SemanticLayerGenerator } from "./semanticLayerGenerator";

export class SemanticLayerGeneratorFactory {
  static getSemanticLayerGenerator(
    dataSourceType: DataSourceType,
    aiProvider: GenerativeAIProvider
  ): SemanticLayerGenerator {
    switch (dataSourceType) {
      case DataSourceType.MONGODB:
        return new MongoDBSemanticLayerGenerator(aiProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
