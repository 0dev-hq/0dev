import { MongoClient } from "mongodb";
import { Client as PGClient } from "pg"; // PostgreSQL Client
import mysql from "mysql2/promise"; // MySQL client
import { IDataSource } from "../models/DataSource";

// Function to fetch schema from MongoDB
export const fetchMongoDBSchema = async (dataSource: IDataSource) => {
  const client = new MongoClient(dataSource.connectionString!);

  try {
    await client.connect();
    const db = client.db(); // Get the default database
    const collections = await db.listCollections().toArray();

    const schema: any = {};
    for (const collection of collections) {
      const sampleDocs = await db
        .collection(collection.name)
        .find({})
        .limit(1)
        .toArray();
      schema[collection.name] = sampleDocs.length
        ? Object.keys(sampleDocs[0])
        : [];
    }
    client.close();
    return schema;
  } catch (error: any) {
    throw new Error(`Failed to fetch MongoDB schema: ${error.message}`);
  } finally {
    await client.close();
  }
};

// Function to fetch schema from PostgreSQL
export const fetchPostgreSQLSchema = async (dataSource: IDataSource) => {
  const regex = /([^:]+):(\d+)\/(.+)/;
  const match = dataSource.connectionString!.match(regex);
  if (!match) {
    return false;
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
    const result = await pgClient.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);

    const schema: any = {};
    result.rows.forEach((row) => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
      });
    });

    return schema;
  } catch (error: any) {
    throw new Error(`Failed to fetch PostgreSQL schema: ${error.message}`);
  } finally {
    await pgClient.end();
  }
};

// Function to fetch schema from MySQL
export const fetchMySQLSchema = async (dataSource: IDataSource) => {
  if (!dataSource) {
    return {};
  }
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

  try {
    const [tables] = await connection.query("SHOW TABLES");

    const schema: any = {};
    for (const tableObj of tables as any[]) {
      const tableName = Object.values(tableObj)[0] as string; // Get the table name
      const [columns]: any[] = await connection.query(
        `SHOW COLUMNS FROM ${tableName}`
      );

      schema[tableName] = columns.map((column: any) => ({
        column: column.Field,
        type: column.Type,
      }));
    }

    return schema;
  } catch (error: any) {
    throw new Error(`Failed to fetch MySQL schema: ${error.message}`);
  } finally {
    await connection.end();
  }
};
