import logger from "../../utils/logger";
import { QueryExecutionResult, QueryExecutor } from "./query-executor";
import mysql from "mysql2/promise";

class MySQLQueryExecutor implements QueryExecutor {
  async executeQuery(
    rawQuery: string,
    dataSource: any,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult> {
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

    const offset = (page - 1) * pageSize;
    // Remove the trailing semicolon if present
    const trimmedQuery = rawQuery.trim();
    const lastChar = trimmedQuery.charAt(trimmedQuery.length - 1);
    const q = lastChar === ";" ? trimmedQuery.slice(0, -1) : trimmedQuery;

    const query = `${q} LIMIT ${pageSize} OFFSET ${offset}`;
    const [rows] = await connection.execute(query);

    // Create a total count query (wrapping the query in a COUNT(*) subquery)
    const totalQuery = `SELECT COUNT(*) as total FROM (${q}) AS totalCountQuery`;
    const [totalResult] = await connection.execute(totalQuery);

    await connection.end();

    const total = (totalResult as any[])[0]?.total;

    return { data: rows as any[], total };
  }
}

export default MySQLQueryExecutor;
