import { MongoClient } from "mongodb";
import {
  ConnectionConfig,
  DataSourceConnectionValidator,
} from "./dataSourceConnectionValidator";

export class MongoDBConnectionValidator
  implements DataSourceConnectionValidator
{
  async validateConnection(config: ConnectionConfig): Promise<boolean> {
    const client = new MongoClient(config.connectionString, {
      auth:
        config.username && config.password
          ? {
              username: config.username,
              password: config.password,
            }
          : undefined,
    });

    try {
      await client.connect();
      await client.db().admin().ping();
      return true;
    } catch (error) {
      return false;
    } finally {
      await client.close();
    }
  }
}
