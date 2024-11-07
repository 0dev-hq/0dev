import { DataSourceType } from "../../models/DataSource";
import { GoogleSheetSchemaAnalyzer } from "./googleSheetSchemaAnalyzer";
import { MongoDBSchemaAnalyzer } from "./mongoDBSchemaAnalyzer";
import { MySQLSchemaAnalyzer } from "./mySQLSchemaAnalyzer";
import { PostgreSQLSchemaAnalyzer } from "./postgreSQLSchemaAnalyzer";
import { SchemaAnalyzer } from "./schemaAnalyzer";

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
