import { DataSourceType } from "../../models/data-source";
import { GenerativeAIProvider } from "../generative-ai-providers/generative-ai-provider";
import { GoogleSheetSemanticLayerGenerator } from "./google-sheet-semantic-layer-generator";
import { MongoDBSemanticLayerGenerator } from "./mongodb-semantic-layer-generator";
import { PostgreSQLSemanticLayerGenerator } from "./postgresql-semantic-layer-generator";
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
      case DataSourceType.POSTGRESQL:
      case DataSourceType.SUPABASE:
      case DataSourceType.MYSQL:
      case DataSourceType.IMPORTED_CSV:
      case DataSourceType.IMPORTED_EXCEL:
        return new PostgreSQLSemanticLayerGenerator(aiProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
