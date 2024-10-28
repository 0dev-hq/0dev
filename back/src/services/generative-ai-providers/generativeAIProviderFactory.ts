import { AIModel, GenerativeAIProvider } from "./generativeAIProvider";
import { OpenAIgenerativeAIProvider } from "./openAIgenerativeAIProvider";

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
