import { Client as PGClient } from "pg"; // PostgreSQL Client
import { IDataSource } from "../../models/DataSource";
import { SchemaAnalyzer } from "./schemaAnalyzer";

export const PostgreSQLSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
    const regex = /([^:]+):(\d+)\/(.+)/;
    const match = dataSource.connectionString!.match(regex);
    if (!match) {
      return false;
    }

    // PostgreSQL connection
    const pgClient = new PGClient({
      user: dataSource.username,
      password: dataSource.password,
      host: match[1],
      port: parseInt(match[2]),
      database: match[3],
    });
    try {
      await pgClient.connect();
      const result = await pgClient.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);

      const schema: any = {};
      result.rows.forEach((row) => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = [];
        }
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
        });
      });

      return schema;
    } catch (error: any) {
      throw new Error(`Failed to fetch PostgreSQL schema: ${error.message}`);
    } finally {
      await pgClient.end();
    }
  },
};
