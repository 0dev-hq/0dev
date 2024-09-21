import { MongoClient } from "mongodb";
import { Pool } from "pg"; // PostgreSQL client
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

    return schema;
  } catch (error: any) {
    throw new Error(`Failed to fetch MongoDB schema: ${error.message}`);
  } finally {
    await client.close();
  }
};

// Function to fetch schema from PostgreSQL
export const fetchPostgreSQLSchema = async (dataSource: IDataSource) => {
  const pool = new Pool({
    connectionString: dataSource.connectionString,
  });

  try {
    const client = await pool.connect();
    const result = await client.query(`
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
    pool.end();
  }
};

// Function to fetch schema from MySQL
export const fetchMySQLSchema = async (dataSource: IDataSource) => {
  const connection = await mysql.createConnection({
    uri: dataSource.connectionString,
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
