import { MongoClient } from "mongodb";
import { IDataSource } from "../../models/DataSource";
import { SchemaAnalyzer } from "./schemaAnalyzer";

export const MongoDBSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
    console.log("Fetching MongoDB schema...");
    console.log(`Data source: ${JSON.stringify(dataSource)}`);
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
  },
};
