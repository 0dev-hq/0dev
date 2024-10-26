export interface DataSourceConnectionValidator {
  validateConnection(config: ConnectionConfig): Promise<boolean>;
}

export interface ConnectionConfig {
  connectionString: string;
  username: string;
  password: string;
  apiKey: string;
  googleSheetId: string;
}
