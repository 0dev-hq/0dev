import { google } from "googleapis";
import { IDataSource } from "../../models/DataSource";
import { SchemaAnalyzer } from "./schemaAnalyzer";

export const GoogleSheetSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
    if (!dataSource.googleSheetId || !dataSource.connectionString) {
      throw new Error("Google Sheet ID or connection string is missing");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(dataSource.connectionString),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
      // Fetch metadata to get all sheet names
      const metadataResponse = await sheets.spreadsheets.get({
        spreadsheetId: dataSource.googleSheetId,
      });

      const allSheets = metadataResponse.data.sheets;
      if (!allSheets || allSheets.length === 0) {
        throw new Error("No sheets found in the Google Sheets document");
      }

      const schema: Record<string, Record<string, string>> = {};

      // Iterate over each sheet
      for (const sheet of allSheets) {
        const sheetName = sheet.properties?.title;
        if (!sheetName) continue;

        // Define a range that captures headers and first 10 rows for type inference
        const range = `${sheetName}!A1:Z10`;

        const response: any = await sheets.spreadsheets.values.get({
          spreadsheetId: dataSource.googleSheetId,
          range,
        });

        const rows: any = response.data.values;
        if (!rows || rows.length < 2) {
          console.warn(
            `Not enough data in sheet "${sheetName}" to infer schema`
          );
          continue;
        }

        const headers: any = rows[0]; // First row as headers
        const sheetSchema: Record<string, string> = {};

        // Analyze each column's data type based on the first few rows
        for (let col = 0; col < headers.length; col++) {
          const columnName = headers[col];
          const columnValues = rows.slice(1).map((row: any) => row[col]);

          // Determine the type by inspecting values in the column
          const inferredType = inferColumnType(columnValues);
          sheetSchema[columnName] = inferredType;
        }

        schema[sheetName] = sheetSchema; // Use sheet name as the entity/table
      }

      return schema;
    } catch (error) {
      console.error("Error fetching Google Sheet schema:", error);
      throw error;
    }
  },
};

// Helper function to infer data type for a column based on its values
function inferColumnType(values: any[]): string {
  let type = "string";

  for (const value of values) {
    if (!value) continue; // Skip empty cells

    if (!isNaN(value) && typeof value !== "boolean") {
      type = "number";
    } else if (
      ["true", "false"].includes(value.toLowerCase()) ||
      typeof value === "boolean"
    ) {
      type = "boolean";
    } else {
      type = "string";
    }

    // If we find a string, keep type as string (to avoid mixed types)
    if (type === "string") break;
  }

  return type;
}
