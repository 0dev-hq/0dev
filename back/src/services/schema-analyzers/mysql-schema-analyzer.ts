import mysql from "mysql2/promise";
import { IDataSource } from "../../models/data-source";
import { SchemaAnalyzer } from "./schema-analyzer";

export const MySQLSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
    if (!dataSource) {
      return {};
    }
    const regex = /([^:]+):(\d+)\/(.+)/;
    const match = dataSource.connectionString!.match(regex);
    if (!match) {
      throw new Error("Invalid MySQL connection string format");
    }

    // MySQL connection
    const connection = await mysql.createConnection({
      host: match[1],
      port: parseInt(match[2]),
      database: match[3],
      user: dataSource.username,
      password: dataSource.password,
    });

    try {
      const [tables] = await connection.query("SHOW TABLES");

      const schema: any = {};
      for (const tableObj of tables as any[]) {
        const tableName = Object.values(tableObj)[0] as string; // Get the table name
        const [columns]: any[] = await connection.query(
          `SHOW COLUMNS FROM ${tableName}`
        );

        schema[tableName] = columns.map((column: any) => ({
          column: column.Field,
          type: column.Type,
        }));
      }

      return schema;
    } catch (error: any) {
    } finally {
      await connection.end();
    }
  },
};
