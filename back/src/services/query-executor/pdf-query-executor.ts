import { Client } from "pg";
import { QueryExecutionResult, QueryExecutor } from "./query-executor";
import {
  GenerativeAIProvider,
  Prompt,
} from "../generative-ai-providers/generative-ai-provider";
import { IDataSource } from "../../models/data-source";
import OpenAI from "openai";
import logger from "../../utils/logger";

export class PDFQueryExecutor implements QueryExecutor {
  private aiProvider: GenerativeAIProvider;

  constructor(aiProvider: GenerativeAIProvider) {
    this.aiProvider = aiProvider;
  }

  async executeQuery(
    rawQuery: string,
    dataSource: IDataSource,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult> {
    const { owner, ingestionInfo } = dataSource;
    const accountId = owner!.toString();
    const fileName = ingestionInfo!.fileName;

    // logger.debug("Executing PDF query:", rawQuery);
    console.log("Executing PDF query:", rawQuery);

    if (!accountId || !fileName) {
      throw new Error("Missing required accountId or fileName in dataSource.");
    }

    // Generate embedding for the raw query
    const queryEmbedding = await this.generateQueryEmbedding(rawQuery);

    // Retrieve relevant chunks from the database
    const textChunks = await this.fetchRelevantChunks(
      accountId,
      fileName,
      queryEmbedding
    );
    console.log("Text chunks:", JSON.stringify(textChunks));

    if (textChunks.length === 0) {
      throw new Error("No relevant data found for the query.");
    }

    // Prepare prompt for AI model
    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an AI that answers user queries and questions based on document content. 

        The user can ask you questions about the document content that you should answer based on the context provided.
        These questions won't get answers that can be used in a report or charts. In this case, provide your answer in this format:
        [
          { "answer": "Your response" }
        ]

        On the other hand if the user asks for information that can be used in a report or charts, provide the answer in a JSON array format 
        like this:
        [
          { "column1": "value1", "column2": "value2",... },
          { "column1": "value1", "column2": "value2",... },
        ]
        `,
      },
      {
        role: "user",
        content: `Based on the following context, answer the query: "${rawQuery}". Context: ${textChunks.join(
          " "
        )}`,
      },
    ];

    // Generate response from AI model
    const aiResponse = await this.aiProvider.generateResponse(prompt, "json");

    return { data: aiResponse as any[], total: 1 };
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const response = await client.embeddings.create({
      input: query,
      model: "text-embedding-3-small",
    });
    return response.data[0].embedding;
  }

  private async fetchRelevantChunks(
    accountId: string,
    fileName: string,
    queryEmbedding: number[]
  ): Promise<string[]> {
    const client = new Client({
      user: process.env.INTERNAL_DB_USER,
      password: process.env.INTERNAL_DB_PASS,
      host: process.env.INTERNAL_DB_HOST,
      port: Number(process.env.INTERNAL_DB_PORT),
      database: process.env.INTERNAL_DB_NAME,
    });

    // Format the embedding as a PostgreSQL array
    const formattedEmbedding = `[${queryEmbedding.join(",")}]`;

    try {
      const query = `
      SELECT text_chunk
      FROM pdf_chunks
      JOIN imported_pdfs ON pdf_chunks.pdf_id = imported_pdfs.id
      WHERE imported_pdfs.owner = $1
      AND imported_pdfs.file_name = $2
      ORDER BY pdf_chunks.embedding <-> $3
      LIMIT 5;
      `;

      await client.connect();
      const result = await client.query(query, [
        accountId,
        fileName,
        formattedEmbedding,
      ]);

      return result.rows.map((row) => row.text_chunk);
    } catch (error: any) {
      logger.error("Error fetching relevant chunks:", error);
      console.log("Error fetching relevant chunks:", error);
      throw new Error("Failed to fetch relevant data");
    } finally {
      client.end();
    }
  }
}
