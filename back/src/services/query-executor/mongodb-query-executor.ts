import { IDataSource } from "../../models/data-source";
import logger from "../../utils/logger";
import { QueryExecutionResult, QueryExecutor } from "./query-executor";
import { MongoClient } from "mongodb";

class MongoDBQueryExecutor implements QueryExecutor {
  async executeQuery(
    rawQuery: string,
    dataSource: IDataSource,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult> {
    const client = new MongoClient(dataSource.connectionString!);
    try {
      await client.connect();
      const db = client.db(); // Use the default database
      const skip = (page - 1) * pageSize;

      // Parse the rawQuery as a JSON object
      const { collection, query, projection } = JSON.parse(rawQuery);

      // Log collection, query, projection, and rawQuery
      logger.debug(`Collection:  ${JSON.stringify(collection)}`);
      logger.debug(`Query:: , ${JSON.stringify(query)}`);
      logger.debug(`Projection:: , ${JSON.stringify(projection)}`);
      logger.debug(`Raw Query:: , ${JSON.stringify(rawQuery)}`);

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
  }
}

export default MongoDBQueryExecutor;
