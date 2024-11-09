import { Client as PGClient } from "pg";
import {
  ConnectionConfig,
  DataSourceConnectionValidator,
} from "./data-source-connection-validator";

export class PostgreSQLConnectionValidator
  implements DataSourceConnectionValidator
{
  async validateConnection(config: ConnectionConfig): Promise<boolean> {
    const regex = /([^:]+):(\d+)\/(.+)/;
    const match = config.connectionString.match(regex);
    if (!match) {
      return false;
    }

    try {
      const pgClient = new PGClient({
        user: config.username,
        password: config.password,
        host: match[1],
        port: parseInt(match[2]),
        database: match[3],
      });
      await pgClient.connect();
      await pgClient.end();
      return true;
    } catch (error) {
      return false;
    }
  }
}
