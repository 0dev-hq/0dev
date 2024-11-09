import { DataSourceType } from "../../models/data-source";
import { DataSourceConnectionValidator } from "./data-source-connection-validator";
import { GoogleSheetConnectionValidator } from "./google-sheet-connection-validator";
import { MongoDBConnectionValidator } from "./mongodb-connection-validator";
import { MySQLConnectionValidator } from "./mysql-connection-validator";
import { PostgreSQLConnectionValidator } from "./postgresql-connection-validator";

export class DataSourceConnectionValidatorFactory {
  static getValidator(
    dataSourceType: DataSourceType
  ): DataSourceConnectionValidator {
    switch (dataSourceType) {
      case DataSourceType.MYSQL:
        return new MySQLConnectionValidator();
      case DataSourceType.POSTGRESQL:
      case DataSourceType.SUPABASE:
        return new PostgreSQLConnectionValidator();
      case DataSourceType.MONGODB:
        return new MongoDBConnectionValidator();
      case DataSourceType.GOOGLE_SHEET:
        return new GoogleSheetConnectionValidator();
      default:
        throw new Error(`Unsupported data source type: ${dataSourceType}`);
    }
  }
}
