import { Client as PGClient } from "pg"; // PostgreSQL Client
import mongoose from "mongoose"; // MongoDB Client
import mysql from "mysql2/promise"; // MySQL Client

/**
 * Validates the MySQL connection string fortmat and attempts to connect to the database using the provided credentials.
 *
 * @param connectionString - The MySQL connection string in the format <host>:<port>/<dbName>.
 * @param username - The username for the MySQL database.
 * @param password - The password for the MySQL database.
 * @param res - The response object to send the result of the validation and connection attempt.
 *
 * @returns A boolean indicating if the connection was successful.
 */
export const validateAndConnectMySql: (
  connectionString: string,
  username: string,
  password: string
) => Promise<boolean> = async (
  connectionString: string,
  username: string,
  password: string
) => {
  // Using Regex check if the connection string hast the format <host>:<port>/<dbName>
  const regex = /([^:]+):(\d+)\/(.+)/;
  const match = connectionString.match(regex);
  if (!match) {
    return false;
  }

  try {
    // MySQL connection
    const mysqlConnection = await mysql.createConnection({
      host: match[1],
      port: parseInt(match[2]),
      database: match[3],
      user: username,
      password: password,
    });
    await mysqlConnection.end();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates the PostgreSQL connection string format and attempts to connect to the database using the provided credentials.
 *
 * @param connectionString - The PostgreSQL connection string in the format <host>:<port>/<dbName>.
 * @param username - The username for the PostgreSQL database.
 * @param password - The password for the PostgreSQL database.
 * @param res - The response object to send the result of the validation and connection attempt.
 *
 * @returns A boolean indicating if the connection was successful.
 */
export const validateAndConnectPostgres: (
  connectionString: string,
  username: string,
  password: string
) => Promise<boolean> = async (
  connectionString: string,
  username: string,
  password: string
) => {
  // Using Regex check if the connection string has the format <host>:<port>/<dbName>
  const regex = /([^:]+):(\d+)\/(.+)/;
  const match = connectionString.match(regex);
  if (!match) {
    return false;
  }

  try {
    // PostgreSQL connection
    const pgClient = new PGClient({
      user: username,
      password: password,
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
};
