import { IDataSource } from "../../models/data-source";
import logger from "../../utils/logger";
import { QueryExecutionResult, QueryExecutor } from "./query-executor";
import { Client as PGClient } from "pg";

class PostgreSQLQueryExecutor implements QueryExecutor {
  async executeQuery(
    rawQuery: string,
    dataSource: IDataSource,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult> {
    const regex = /([^:]+):(\d+)\/(.+)/;
    const match = dataSource.connectionString!.match(regex);
    if (!match) {
      throw new Error("Invalid PostgreSQL connection string format");
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
      const offset = (page - 1) * pageSize;
      // Remove the trailing semicolon if present
      const trimmedQuery = rawQuery.trim();
      const lastChar = trimmedQuery.charAt(trimmedQuery.length - 1);
      const q = lastChar === ";" ? trimmedQuery.slice(0, -1) : trimmedQuery;

      const query = `${q} LIMIT ${pageSize} OFFSET ${offset}`;
      const result = await pgClient.query(query);
      const totalResult = await pgClient.query(
        `SELECT COUNT(*) as total FROM (${q}) AS totalCountQuery`
      );

      const total = totalResult.rows[0]?.total;

      return { data: result.rows, total };
    } catch (error) {
      logger.error("Error executing PostgreSQL query:", error);
      throw new Error("Query execution failed");
    } finally {
      await pgClient.end();
    }
  }
}

export default PostgreSQLQueryExecutor;
