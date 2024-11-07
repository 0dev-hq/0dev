import { DataSourceType } from "../../models/DataSource";
import logger from "../../utils/logger";
import { Prompt } from "../generative-ai-providers/generativeAIProvider";
import { QueryBuilder } from "./query-builder";

class GoogleSheetQueryBuilder extends QueryBuilder {
  async generateQuery(description: string, analysisInfo: any): Promise<string> {
    const systemContext = `
      You are an expert developer that generates JavaScript code to query data from Google Sheets.
      Use the GoogleSheetDataAccessor instance, "accessor", to retrieve data from specific sheets as needed.
      Here is how you can retrieve data:
      
      // Retrieve data from a specific sheet by its name
      const data = await accessor.getData("Sheet1"); // Replace "Sheet1" with the actual sheet name
      This is the analysis of the google spreadsheet: ${JSON.stringify(
        analysisInfo
      )}.


      Ensure the code:
      1. Retrieves data from the correct sheet(s) using accessor.getData(sheetName).
      2. Applies filters, sorting, and aggregation as described in the prompt.
      3. Returns the results in an object format as { data: [...], total: number }.
      Notes:
      IMPORTANT: Only return JavaScript code without any comments, explanation, or extra content.
      IMPORTANT: Do not make any assumptions about the data or the schema other than what is provided in in the analysis.
    `;

    const prompt: Prompt = [
      { role: "system", content: systemContext },
      {
        role: "user",
        content: `Generate JavaScript code based on the following description: ${description}.`,
      },
    ];

    const rawQuery = await this.aiProvider.generateResponse(prompt, "string");

    // Clean up unwanted formatting like ```js or any other extra text
    const cleanQuery = rawQuery
      .replace(/^\s*```[a-zA-Z]*\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    logger.debug(`Generated query: ${cleanQuery}`);
    return cleanQuery;
  }
}

export default GoogleSheetQueryBuilder;
