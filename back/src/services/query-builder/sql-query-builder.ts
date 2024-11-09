import { DataSourceType } from "../../models/data-source";
import logger from "../../utils/logger";
import { Prompt } from "../generative-ai-providers/generative-ai-provider";
import { QueryBuilder } from "./query-builder";

class SQLQueryBuilder extends QueryBuilder {
  constructor(aiProvider: any, private dataSourceType: DataSourceType) {
    super(aiProvider);
    this.dataSourceType = dataSourceType;
  }

  async generateQuery(description: string, analysisInfo: any): Promise<any> {
    const systemContext = `
        You are an expert developer that generates database queries based on user requests.
        The database is a ${this.dataSourceType} system. 
        I am using traditional SQL syntax to interact with the data.
        This is the analysis of the database: ${JSON.stringify(analysisInfo)}.
        Please generate a SQL query based on the description provided.
        Note:
        IMPORTANT: Your answer should directly give the query without anything before or after that. No explanation, or comments.
        IMPORTANT: Absolutely do not include pagination using the SQL LIMIT and OFFSET clauses.
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
    await validateRawQuery(cleanQuery, this.dataSourceType);

    return rawQuery;
  }
}

// todo: improve validation
// todo: validate SQL query
const validateRawQuery = async (rawQuery: string, dataSourceType: string) => {};

export default SQLQueryBuilder;
