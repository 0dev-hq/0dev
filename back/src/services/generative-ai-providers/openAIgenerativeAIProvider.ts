import axios from "axios";
import {
  GenerativeAIProvider,
  GenerativeAIOutputFormat,
  Prompt,
  GenerativeAIResponse,
  AIModel,
} from "./generativeAIProvider";

export class OpenAIgenerativeAIProvider extends GenerativeAIProvider {
  private apiClient = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: { "Content-Type": "application/json" },
  });

  constructor(aiModel: AIModel) {
    if (aiModel.provider !== "openai") {
      throw new Error("AI Model not supported by OpenAI provider.");
    }
    super(aiModel); // Pass aiModel to the abstract class constructor
  }

  async generateResponse<T extends GenerativeAIOutputFormat>(
    prompt: Prompt,
    format: T
  ): Promise<GenerativeAIResponse<T>> {
    const apiToken = process.env.OPENAI_API_KEY;
    if (!apiToken) {
      throw new Error("OpenAI API key not configured");
    }

    const payload = {
      model: this.modelName,
      messages: prompt,
    };

    try {
      const response = await this.apiClient.post("/chat/completions", payload, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      // Parse response based on expected output format
      const content = response.data.choices[0].message.content.trim();
      if (format === "json") {
        return JSON.parse(content) as GenerativeAIResponse<T>;
      }
      return content as GenerativeAIResponse<T>;
    } catch (error) {
      console.error("Error generating response from OpenAI:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
