import { DataSourceType } from "../../models/data-source";
import { JSVM2Executor } from "../code-executor/js-vm2-executor";
import { GoogleSheetQueryExecutor } from "./google-sheet-query-executor";
import MongoDBQueryExecutor from "./mongodb-query-executor";
import MySQLQueryExecutor from "./mysql-query-executor";
import PostgreSQLQueryExecutor from "./postgresql-query-executor";
import { QueryExecutor } from "./query-executor";

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
      default:
        throw new Error("Unsupported data source type");
    }
  }
}
