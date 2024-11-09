import { DataSourceType } from "../../models/data-source";
import { GenerativeAIProvider } from "../generative-ai-providers/generative-ai-provider";
import { GoogleSheetSemanticLayerGenerator } from "./google-sheet-semantic-layer-generator";
import { MongoDBSemanticLayerGenerator } from "./mongodb-semantic-layer-generator";
import { SemanticLayerGenerator } from "./semantic-layer-generator";

export class SemanticLayerGeneratorFactory {
  static getSemanticLayerGenerator(
    dataSourceType: DataSourceType,
    aiProvider: GenerativeAIProvider
  ): SemanticLayerGenerator {
    switch (dataSourceType) {
      case DataSourceType.MONGODB:
        return new MongoDBSemanticLayerGenerator(aiProvider);
      case DataSourceType.GOOGLE_SHEET:
        return new GoogleSheetSemanticLayerGenerator(aiProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
