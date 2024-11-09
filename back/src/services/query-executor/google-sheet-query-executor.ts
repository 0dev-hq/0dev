import { QueryExecutionResult, QueryExecutor } from "./query-executor";
import logger from "../../utils/logger";
import { CodeExecutor } from "../code-executor/code-executor";
import { google } from "googleapis";

export class GoogleSheetQueryExecutor implements QueryExecutor {
  private codeExecutor: CodeExecutor;

  constructor(codeExecutor: CodeExecutor) {
    this.codeExecutor = codeExecutor;
  }

  async executeQuery(
    rawQuery: string,
    dataSource: any,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult> {
    const accessor = new GoogleSheetDataAccessor(
      dataSource.connectionString,
      dataSource.googleSheetId
    );

    console.log("Executing Google Sheets query:", rawQuery);

    try {
      // Execute the JavaScript code using the injected code executor
      const result = await this.codeExecutor.execute(rawQuery, {
        accessor,
        page,
        pageSize,
      });
      logger.debug("Execution result:", result);
      return result;
    } catch (error) {
      logger.error("Error executing Google Sheets query:", error);
      throw new Error("Query execution failed");
    }
  }
}

class GoogleSheetDataAccessor {
  private sheets: any;
  private spreadsheetId: string;
  private cache: Map<string, any[]>; // Cache data by sheet name

  constructor(connectionString: string, spreadsheetId: string) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(connectionString),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = spreadsheetId;
    this.cache = new Map(); // Initialize cache
  }

  // Fetch data from a specified sheet and cache it
  async getData(sheetName: string): Promise<any[]> {
    if (this.cache.has(sheetName)) {
      return this.cache.get(sheetName)!; // Return cached data if available
    }

    try {
      const range = `${sheetName}!A1:Z3000`; // TODO: Improve range
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) throw new Error("Insufficient data");

      // Convert rows to objects with headers as keys
      const headers = rows[0];
      const data = rows.slice(1).map((row: any) =>
        headers.reduce(
          (acc: Record<string, any>, header: string, index: number) => {
            acc[header] = row[index] || null;
            return acc;
          },
          {} as Record<string, any>
        )
      );

      this.cache.set(sheetName, data); // Cache the data
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch data from sheet "${sheetName}": ${error}`
      );
    }
  }

  // Clear the cache (if needed, for example, when data changes)
  clearCache(sheetName?: string) {
    if (sheetName) {
      this.cache.delete(sheetName);
    } else {
      this.cache.clear();
    }
  }
}
