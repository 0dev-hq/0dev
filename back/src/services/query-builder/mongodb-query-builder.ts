import logger from "../../utils/logger";
import { Prompt } from "../generative-ai-providers/generative-ai-provider";
import { QueryBuilder } from "./query-builder";

class MongoDBQueryBuilder extends QueryBuilder {
  async generateQuery(description: string, analysisInfo: any): Promise<any> {
    const systemContext = `
        You are an expert developer that generates database queries based on user requests.
        The database is a MongoDB system.
        I am using the MongoDB query language (not Mongoose) to interact with the MongoDB collections.
        This is the analysis of the database: ${JSON.stringify(analysisInfo)}.
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
        IMPORTANT: Make sure to structure the query to support pagination.
      `;

    const prompt: Prompt = [
      {
        role: "system",
        content: systemContext,
      },
      {
        role: "user",
        content: `Generate a query based on the following description: ${description}`,
      },
    ];

    const rawQuery = await this.aiProvider.generateResponse(prompt, "string");

    // Clean up unwanted formatting like ```sql, ```json, or any other extra text
    const cleanQuery = rawQuery
      .replace(/^\s*```[a-zA-Z]*\s*/, "") // Remove leading ```sql or ```json
      .replace(/\s*```$/, "") // Remove trailing ```
      .trim(); // Clean up whitespace

    logger.debug(`rawQuery: ${cleanQuery}`);
    // Validate the rawQuery
    await validateRawQuery(cleanQuery);

    return rawQuery;
  }
}

// todo: improve validation
const validateRawQuery = async (rawQuery: string) => {
  try {
    const { collection, query, projection } = JSON.parse(rawQuery);
  } catch (error) {
    throw new Error("Invalid MongoDB query generated");
  }
};

export default MongoDBQueryBuilder;
