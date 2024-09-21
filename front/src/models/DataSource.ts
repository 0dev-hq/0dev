export interface DataSource {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  lastTimeAnalyzed?: string;
  connectionString?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  googleSheetId?: string;
  createdBy?: string; // User ID from authentication
}
