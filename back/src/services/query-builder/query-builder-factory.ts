import { DataSourceType } from "../../models/DataSource";
import { GenerativeAIProvider } from "../generative-ai-providers/generativeAIProvider";
import GoogleSheetQueryBuilder from "./google-sheet-query-builder";
import MongoDBQueryBuilder from "./mongoDBQueryBuilder";
import { QueryBuilder } from "./query-builder";
import SQLQueryBuilder from "./sqlQueryBuilder";

export class QueryBuilderFactory {
  static getQueryBuilder(
    dataSourceType: DataSourceType,
    aiProvider: GenerativeAIProvider
  ): QueryBuilder {
    switch (dataSourceType) {
      case DataSourceType.MONGODB:
        return new MongoDBQueryBuilder(aiProvider);
      case DataSourceType.POSTGRESQL:
      case DataSourceType.SUPABASE:
      case DataSourceType.MYSQL:
        return new SQLQueryBuilder(aiProvider, dataSourceType);
      case DataSourceType.GOOGLE_SHEET:
        return new GoogleSheetQueryBuilder(aiProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
