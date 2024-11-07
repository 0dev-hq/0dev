import { DataSourceType } from "../../models/DataSource";
import { GenerativeAIProvider } from "../generative-ai-providers/generativeAIProvider";
import { GoogleSheetSemanticLayerGenerator } from "./googleSheetSemanticLayerGenerator";
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
      case DataSourceType.GOOGLE_SHEET:
        return new GoogleSheetSemanticLayerGenerator(aiProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
