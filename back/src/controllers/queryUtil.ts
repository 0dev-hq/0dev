import { generateAIResponse } from "./aiUtil";
import { Pool } from "pg"; // PostgreSQL
import mysql from "mysql2/promise"; // MySQL
import { MongoClient } from "mongodb";

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
        Make sure to include pagination using the SQL LIMIT and OFFSET clauses.
        IMPORTANT: Your answer should directly give the query without anything before or after that. No explanation, or comments.
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

  console.log(`rawQuery: ${rawQuery}`);

  // Clean up unwanted formatting like ```sql, ```json, or any other extra text
  rawQuery = rawQuery
    .replace(/^\s*```[a-zA-Z]*\s*/, "") // Remove leading ```sql or ```json
    .replace(/\s*```$/, "") // Remove trailing ```
    .trim(); // Clean up whitespace

  // Validate the rawQuery
  // todo: improve validation
  try {
    const { collection, query, projection } = JSON.parse(rawQuery);
  } catch (error) {
    console.error("Error parsing rawQuery:", error);
    throw new Error("failed");
  }

  return rawQuery;
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
    console.log("Collection:", collection);
    console.log("Query:", query);
    console.log("Projection:", projection);
    console.log("Raw Query:", rawQuery);

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
    console.error("Error executing MongoDB query:", error);
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
  const pool = new Pool({
    connectionString: dataSource.connectionString,
  });

  const offset = (page - 1) * pageSize;
  const query = `${rawQuery} LIMIT ${pageSize} OFFSET ${offset}`; // Add pagination to SQL query
  const result = await pool.query(query);

  return result.rows;
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
  const connection = await mysql.createConnection({
    uri: dataSource.connectionString,
  });

  const offset = (page - 1) * pageSize;
  const query = `${rawQuery} LIMIT ${pageSize} OFFSET ${offset}`;
  const [rows] = await connection.execute(query);

  await connection.end();
  return rows;
};
