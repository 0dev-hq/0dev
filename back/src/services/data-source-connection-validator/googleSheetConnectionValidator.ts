import { google } from "googleapis";
import {
  ConnectionConfig,
  DataSourceConnectionValidator,
} from "./dataSourceConnectionValidator";

export class GoogleSheetConnectionValidator
  implements DataSourceConnectionValidator
{
  async validateConnection(config: ConnectionConfig): Promise<boolean> {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(config.connectionString!),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      // Attempt a basic request to verify connectivity
      const response = await sheets.spreadsheets.get({
        spreadsheetId: config.googleSheetId,
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
