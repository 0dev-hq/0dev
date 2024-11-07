import { DataSourceType } from "../../models/DataSource";
import { DataSourceConnectionValidator } from "./dataSourceConnectionValidator";
import { GoogleSheetConnectionValidator } from "./googleSheetConnectionValidator";
import { MongoDBConnectionValidator } from "./mongoDBConnectionValidator";
import { MySQLConnectionValidator } from "./mySQLConnectionValidator";
import { PostgreSQLConnectionValidator } from "./postgreSQLConnectionValidator";

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
