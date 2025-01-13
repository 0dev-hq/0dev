import { Request, Response } from "express";
import Query from "../models/query";
import DataSource, { DataSourceType, IDataSource } from "../models/data-source";
import logger from "../utils/logger";
import { GenerativeAIProviderFactory } from "../services/generative-ai-providers/generative-ai-provider-factory";
import { QueryBuilderFactory } from "../services/query-builder/query-builder-factory";
import { QueryExecutorFactory } from "../services/query-executor/query-executor-factory";
import { AIModel } from "../services/generative-ai-providers/generative-ai-provider";
import AgentRegistryAction from "../models/agent-registry-actions";

const generativeAIProvider =
  GenerativeAIProviderFactory.getGenerativeAIProvider({
    provider: process.env.GENERATIVE_AI_PROVIDER! as AIModel["provider"],
    modelName: process.env.GENERATIVE_AI_MODEL_NAME! as AIModel["modelName"],
  } as AIModel);

export const listActions = async (req: Request, res: Response) => {
  // const allActions = [
  //   {
  //     id: 1,
  //     name: "Send message",
  //     service: "Slack",
  //     tags: ["communication"],
  //     description: "Send a message to a Slack channel or user.",
  //     inputs: ["channel", "message"],
  //     outputs: ["messageId", "timestamp"],
  //     creator: "Official",
  //   },
  //   {
  //     id: 2,
  //     name: "Create ticket",
  //     service: "Zendesk",
  //     tags: ["support"],
  //     description: "Create a new support ticket in Zendesk.",
  //     inputs: ["subject", "description", "priority"],
  //     outputs: ["ticketId", "ticketUrl"],
  //     creator: "Official",
  //   },
  //   {
  //     id: 3,
  //     name: "Assign issue",
  //     service: "Jira",
  //     tags: ["project management"],
  //     description: "Assign a Jira issue to a team member.",
  //     inputs: ["issueId", "assigneeId"],
  //     outputs: ["success", "assignedTo"],
  //     creator: "Official",
  //   },
  //   {
  //     id: 4,
  //     name: "Post update",
  //     service: "Slack",
  //     tags: ["communication"],
  //     description: "Post an update to a Slack channel.",
  //     inputs: ["channel", "message"],
  //     outputs: ["messageId", "timestamp"],
  //     creator: "Official",
  //   },
  //   {
  //     id: 5,
  //     name: "Close ticket",
  //     service: "Zendesk",
  //     tags: ["support"],
  //     description: "Close an existing support ticket in Zendesk.",
  //     inputs: ["ticketId", "resolution"],
  //     outputs: ["success", "closedAt"],
  //     creator: "Official",
  //   },
  //   {
  //     id: 6,
  //     name: "Create sprint",
  //     service: "Jira",
  //     tags: ["project management"],
  //     description: "Create a new sprint in a Jira project.",
  //     inputs: ["projectId", "sprintName", "startDate", "endDate"],
  //     outputs: ["sprintId", "sprintUrl"],
  //     creator: "Official",
  //   },
  // ];

  try {
    const allActions = await AgentRegistryAction.find();
    return res.json(allActions);
  } catch (error) {
    logger.error("Failed to fetch actions:", error);
    return res.status(500).json({ message: "Failed to fetch actions", error });
  }
};
