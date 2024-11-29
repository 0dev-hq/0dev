import { DataSourceType } from "../../models/data-source";
import { JSVM2Executor } from "../code-executor/js-vm2-executor";
import { AIModel } from "../generative-ai-providers/generative-ai-provider";
import { GenerativeAIProviderFactory } from "../generative-ai-providers/generative-ai-provider-factory";
import { GoogleSheetQueryExecutor } from "./google-sheet-query-executor";
import MongoDBQueryExecutor from "./mongodb-query-executor";
import MySQLQueryExecutor from "./mysql-query-executor";
import { PDFQueryExecutor } from "./pdf-query-executor";
import PostgreSQLQueryExecutor from "./postgresql-query-executor";
import { QueryExecutor } from "./query-executor";
import { WordQueryExecutor } from "./word-query-executor";

const generativeAIProvider =
  GenerativeAIProviderFactory.getGenerativeAIProvider({
    provider: process.env.GENERATIVE_AI_PROVIDER! as AIModel["provider"],
    modelName: process.env.GENERATIVE_AI_MODEL_NAME! as AIModel["modelName"],
  } as AIModel);

export class QueryExecutorFactory {
  static getQueryExecutor(dataSourceType: DataSourceType): QueryExecutor {
    switch (dataSourceType) {
      case DataSourceType.MONGODB:
        return new MongoDBQueryExecutor();
      case DataSourceType.POSTGRESQL:
      case DataSourceType.SUPABASE:
        return new PostgreSQLQueryExecutor();
      case DataSourceType.MYSQL:
        return new MySQLQueryExecutor();
      case DataSourceType.GOOGLE_SHEET:
        return new GoogleSheetQueryExecutor(new JSVM2Executor());
      case DataSourceType.IMPORTED_PDF:
        return new PDFQueryExecutor(generativeAIProvider);
      case DataSourceType.IMPORTED_WORD:
        return new WordQueryExecutor(generativeAIProvider);
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
