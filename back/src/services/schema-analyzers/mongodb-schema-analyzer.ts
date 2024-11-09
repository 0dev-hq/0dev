import { MongoClient } from "mongodb";
import { IDataSource } from "../../models/data-source";
import { SchemaAnalyzer } from "./schema-analyzer";

export const MongoDBSchemaAnalyzer: SchemaAnalyzer = {
  fetchSchema: async (dataSource: IDataSource) => {
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
        schema[collection.name] = [];
        for (const key in sampleDocs[0]) {
          schema[collection.name].push({
            column: key,
            type: typeof sampleDocs[0][key],
          });
        }
      }
      return schema;
    } catch (error: any) {
    } finally {
      await client.close();
    }
  },
};
