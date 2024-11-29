import { Client } from "pg";
import { IDataSource } from "../../models/data-source";
import { SchemaAnalyzer } from "./schema-analyzer";

export const InternalPostgreSQLSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
    if (
      !dataSource.ingestionInfo?.tableNames ||
      dataSource.ingestionInfo.tableNames.length === 0
    ) {
      throw new Error("No table names available in the data source.");
    }

    const client = new Client({
      user: process.env.INTERNAL_DB_USER,
      password: process.env.INTERNAL_DB_PASS,
      host: process.env.INTERNAL_DB_HOST,
      port: Number(process.env.INTERNAL_DB_PORT),
      database: process.env.INTERNAL_DB_NAME,
    });

    try {
      await client.connect();

      const query = `
        SELECT
          c.table_name,
          c.column_name,
          c.data_type,
          tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu
          ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        WHERE c.table_schema = 'public'
          AND c.table_name = ANY ($1)
      `;

      // Use table names from the ingestionInfo field
      const tableNames = dataSource.ingestionInfo.tableNames;

      // Execute the query with the table names as a parameter
      const result = await client.query(query, [tableNames]);

      const schema: Record<
        string,
        Array<{ column: string; type: string; constraint: string | null }>
      > = {};
      result.rows.forEach((row) => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = [];
        }
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          constraint: row.constraint_type || null,
        });
      });

      return schema;
    } catch (error: any) {
      console.error("Error fetching schema:", error);
      throw error;
    } finally {
      await client.end();
    }
  },
};
