import { generateAIResponse } from "./aiUtil";
import { Client as PGClient } from "pg"; // PostgreSQL Client
import mysql from "mysql2/promise"; // MySQL
import { MongoClient } from "mongodb";
import logger from "../utils/logger";

export const generateSQLQuery = async (
  description: string,
  schema: any, // Schema information for the data source
  dataSourceType: string, // Type of data source (e.g., mysql, postgresql, mongodb)
  model: string = "gpt-4o-mini"
) => {
  // Provide context based on the data source type
  let context;
  switch (dataSourceType) {
    case "mysql":
    case "postgresql":
      context = `
        The database is a ${dataSourceType} system. 
        I am using traditional SQL syntax to interact with the data.
        The schema is as follows: ${JSON.stringify(schema)}.
        Please generate a SQL query based on the description provided.
        IMPORTANT: Your answer should directly give the query without anything before or after that. No explanation, or comments.
        IMPORTANT: Absolutely do not include pagination using the SQL LIMIT and OFFSET clauses.
      `;
      break;
    case "mongodb":
      context = `
        The database is a MongoDB system.
        I am using the MongoDB query language (not Mongoose) to interact with the MongoDB collections.
        The schema is as follows: ${JSON.stringify(schema)}.
        Please generate a MongoDB query object based on the description provided.
        The query should include proper MongoDB syntax and pagination using skip() and limit().
        The output must be a valid MongoDB query in JSON format, including collection, fields for projection.
        I'll use your JSON like this:
        db.collection(collection)
        .find(query)
        .project(projection)
        IMPORTANT: Only return the JSON object, no explanation or extra content.
        IMPORTANT: Absolutely no comments in the JSON object.
        IMPORTANT: Absolutely no skip or limit in the JSON object.
      `;
      break;
    default:
      throw new Error("Unsupported data source type");
  }

  const prompt = [
    {
      role: "system",
      content:
        "You are an expert developer that generates database queries based on user requests.",
    },
    {
      role: "user",
      content: `Generate a query based on the following description: ${description}`,
    },
    {
      role: "user",
      content: context,
    },
    {
      role: "user",
      content: "Make sure to structure the query to support pagination.",
    },
  ];

  let rawQuery = await generateAIResponse(model, prompt);

  // Clean up unwanted formatting like ```sql, ```json, or any other extra text
  rawQuery = rawQuery
    .replace(/^\s*```[a-zA-Z]*\s*/, "") // Remove leading ```sql or ```json
    .replace(/\s*```$/, "") // Remove trailing ```
    .trim(); // Clean up whitespace

  logger.debug(`rawQuery: ${rawQuery}`);
  // Validate the rawQuery
  await validateRawQuery(rawQuery, dataSourceType);

  return rawQuery;
};

// todo: improve validation
const validateRawQuery = async (rawQuery: string, dataSourceType: string) => {
  switch (dataSourceType) {
    case "mysql":
    case "postgresql":
      // todo: validate SQL query
      break;
    case "mongodb":
      try {
        const { collection, query, projection } = JSON.parse(rawQuery);
      } catch (error) {
        throw new Error("Invalid MongoDB query generated");
      }
      break;
    default:
      throw new Error("Unsupported data source type");
  }
};

/**
 * Executes a MongoDB query.
 * @param rawQuery - The raw query string.
 * @param dataSource - The data source object containing the connection string.
 * @param page - The current page number for pagination.
 * @param pageSize - The number of results per page.
 */
export const executeMongoDBQuery = async (
  rawQuery: string,
  dataSource: any,
  page: number,
  pageSize: number
) => {
  const client = new MongoClient(dataSource.connectionString);
  try {
    await client.connect();
    const db = client.db(); // Use the default database
    const skip = (page - 1) * pageSize;

    // Parse the rawQuery as a JSON object
    const { collection, query, projection } = JSON.parse(rawQuery);

    // Log collection, query, projection, and rawQuery
    logger.verbose(`Collection:  ${JSON.stringify(collection)}`);
    logger.verbose(`Query:: , ${JSON.stringify(query)}`);
    logger.verbose(`Projection:: , ${JSON.stringify(projection)}`);
    logger.verbose(`Raw Query:: , ${JSON.stringify(rawQuery)}`);

    // Get the collection based on the name in the query
    const col = db.collection(collection);

    // Fetch the total count of documents that match the query (before pagination)
    const totalDocuments = await col.countDocuments(query);

    const result = await db
      .collection(collection) // Use the specified collection
      .find(query)
      .project(projection) // Use projection to limit the fields returned
      .skip(skip)
      .limit(pageSize)
      .toArray(); // Convert the cursor to an array
    return { data: result, total: totalDocuments };
  } catch (error) {
    logger.error("Error executing MongoDB query:", error);
    throw new Error("Query execution failed");
  } finally {
    await client.close();
  }
};

/**
 * Executes a PostgreSQL query.
 * @param rawQuery - The raw query string.
 * @param dataSource - The data source object containing the connection string.
 * @param page - The current page number for pagination.
 * @param pageSize - The number of results per page.
 */
export const executePostgresQuery = async (
  rawQuery: string,
  dataSource: any,
  page: number,
  pageSize: number
) => {
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
    const offset = (page - 1) * pageSize;
    // Remove the trailing semicolon if present
    const trimmedQuery = rawQuery.trim();
    const lastChar = trimmedQuery.charAt(trimmedQuery.length - 1);
    const q = lastChar === ";" ? trimmedQuery.slice(0, -1) : trimmedQuery;

    const query = `${q} LIMIT ${pageSize} OFFSET ${offset}`;
    const result = await pgClient.query(query);
    const totalResult = await pgClient.query(
      `SELECT COUNT(*) as total FROM (${q}) AS totalCountQuery`
    );

    const total = totalResult.rows[0]?.total;

    return { data: result.rows, total };
  } catch (error) {
    logger.error("Error executing PostgreSQL query:", error);
    throw new Error("Query execution failed");
  } finally {
    await pgClient.end();
  }
};

/**
 * Executes a MySQL query.
 * @param rawQuery - The raw query string.
 * @param dataSource - The data source object containing the connection string.
 * @param page - The current page number for pagination.
 * @param pageSize - The number of results per page.
 */
export const executeMySQLQuery = async (
  rawQuery: string,
  dataSource: any,
  page: number,
  pageSize: number
) => {
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

  const offset = (page - 1) * pageSize;
  // Remove the trailing semicolon if present
  const trimmedQuery = rawQuery.trim();
  const lastChar = trimmedQuery.charAt(trimmedQuery.length - 1);
  const q = lastChar === ";" ? trimmedQuery.slice(0, -1) : trimmedQuery;

  const query = `${q} LIMIT ${pageSize} OFFSET ${offset}`;
  const [rows] = await connection.execute(query);

  // Create a total count query (wrapping the query in a COUNT(*) subquery)
  const totalQuery = `SELECT COUNT(*) as total FROM (${q}) AS totalCountQuery`;
  const [totalResult] = await connection.execute(totalQuery);

  await connection.end();

  const total = (totalResult as any[])[0]?.total;

  return { data: rows, total };
};
