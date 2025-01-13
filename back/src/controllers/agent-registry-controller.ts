import { Request, Response } from "express";
import logger from "../utils/logger";
import { GenerativeAIProviderFactory } from "../services/generative-ai-providers/generative-ai-provider-factory";
import AgentRegistryAction from "../models/agent-registry-actions";
import { AIModel } from "../services/generative-ai-providers/generative-ai-provider";

const generativeAIProvider =
  GenerativeAIProviderFactory.getGenerativeAIProvider({
    provider: process.env.GENERATIVE_AI_PROVIDER! as AIModel["provider"],
    modelName: process.env.GENERATIVE_AI_MODEL_NAME! as AIModel["modelName"],
  } as AIModel);

export const listActions = async (req: Request, res: Response) => {
  try {
    const allActions = await AgentRegistryAction.find();
    return res.json(allActions);
  } catch (error) {
    logger.error("Failed to fetch actions:", error);
    return res.status(500).json({ message: "Failed to fetch actions", error });
  }
};
