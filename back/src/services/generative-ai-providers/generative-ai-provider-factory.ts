import { AIModel, GenerativeAIProvider } from "./generative-ai-provider";
import { OpenAIgenerativeAIProvider } from "./openai-generative-ai-provider";

export class GenerativeAIProviderFactory {
  static getGenerativeAIProvider(aiModel: AIModel): GenerativeAIProvider {
    switch (aiModel.provider) {
      case "openai":
        return new OpenAIgenerativeAIProvider(aiModel);
      default:
        throw new Error(`Unsupported provider: ${aiModel.provider}`);
    }
  }
}
