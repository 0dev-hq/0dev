import mysql from "mysql2/promise";
import {
  ConnectionConfig,
  DataSourceConnectionValidator,
} from "./dataSourceConnectionValidator";

export class MySQLConnectionValidator implements DataSourceConnectionValidator {
  async validateConnection(config: ConnectionConfig): Promise<boolean> {
    const regex = /([^:]+):(\d+)\/(.+)/;
    const match = config.connectionString.match(regex);
    if (!match) {
      return false;
    }

    try {
      const mysqlConnection = await mysql.createConnection({
        host: match[1],
        port: parseInt(match[2]),
        database: match[3],
        user: config.username,
        password: config.password,
      });
      await mysqlConnection.end();
      return true;
    } catch (error) {
      return false;
    }
  }
}
