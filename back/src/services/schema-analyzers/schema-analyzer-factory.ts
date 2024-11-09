import { DataSourceType } from "../../models/data-source";
import { GoogleSheetSchemaAnalyzer } from "./google-sheet-schema-analyzer";
import { MongoDBSchemaAnalyzer } from "./mongodb-schema-analyzer";
import { MySQLSchemaAnalyzer } from "./mysql-schema-analyzer";
import { PostgreSQLSchemaAnalyzer } from "./postgresql-schema-analyzer";
import { SchemaAnalyzer } from "./schema-analyzer";

export class SchemaAnalyzerFactory {
  static getSchemaAnalyzer(dataSourceType: DataSourceType): SchemaAnalyzer {
    switch (dataSourceType) {
      case DataSourceType.MONGODB:
        return MongoDBSchemaAnalyzer;
      case DataSourceType.POSTGRESQL:
      case DataSourceType.SUPABASE:
        return PostgreSQLSchemaAnalyzer;
      case DataSourceType.MYSQL:
        return MySQLSchemaAnalyzer;
      case DataSourceType.GOOGLE_SHEET:
        return GoogleSheetSchemaAnalyzer;
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
