import { Request, Response } from "express";
import Query from "../models/query";
import DataSource, { DataSourceType } from "../models/data-source";
import logger from "../utils/logger";
import { GenerativeAIProviderFactory } from "../services/generative-ai-providers/generative-ai-provider-factory";
import { QueryBuilderFactory } from "../services/query-builder/query-builder-factory";
import { QueryExecutorFactory } from "../services/query-executor/query-executor-factory";

const generateQueryUtil = async (
  description: string,
  analysisInfo: any,
  dataSourceType: DataSourceType
) => {
  const generativeAIProvider =
    GenerativeAIProviderFactory.getGenerativeAIProvider({
      provider: "openai",
      modelName: "gpt-4o-mini",
    });

  const queryBuilder = QueryBuilderFactory.getQueryBuilder(
    dataSourceType,
    generativeAIProvider
  );
  const rawQuery = await queryBuilder.generateQuery(description, analysisInfo);
  console.log(`analysisInfo: ${JSON.stringify(analysisInfo, null, 2)}`);
  console.log(`rawQuery: ${rawQuery}`);
  return rawQuery;
};

// Create a new query
export const createQuery = async (req: Request, res: Response) => {
  const {
    name,
    description,
    dataSource,
  }: { name: string; description: string; dataSource: string } = req.body;

  try {
    // Fetch the data source and its schema
    const dataSourceDoc = await DataSource.findById(dataSource);
    if (!dataSourceDoc) {
      return res.status(404).json({ message: "Data source not found" });
    }

    let newQuery = new Query({
      name,
      description,
      dataSource,
      createdBy: req.user!.id,
      operation: "read", // Hardcoded to 'read' for now
    });

    if (dataSourceDoc.analysisInfo) {
      // Generate the new raw query based on the updated description and schema
      const rawQuery = await generateQueryUtil(
        description,
        dataSourceDoc.analysisInfo,
        dataSourceDoc.type
      );

      newQuery.raw = rawQuery;
    }

    await newQuery.save();
    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to create query:", error);
    return res.status(500).json({ message: "Failed to create query", error });
  }
};

// Generate raw query for the query
export const buildQuery = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Fetch the query by ID and ensure it was created by the authenticated user
    const query = await Query.findOne({ _id: id, createdBy: req.user!.id });
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // Fetch the associated data source
    const dataSource = await DataSource.findById(query.dataSource);
    if (!dataSource || !dataSource.analysisInfo) {
      return res.status(404).json({ message: "Data source not found" });
    }

    const rawQuery = await generateQueryUtil(
      query.description,
      dataSource.analysisInfo,
      dataSource.type
    );

    // Update the query with the new raw query
    query.raw = rawQuery;
    await query.save();

    return res.sendStatus(200);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to generate raw query", error });
  }
};

// Get all queries for the authenticated user
export const getQueries = async (req: Request, res: Response) => {
  try {
    const queries = await Query.find({ createdBy: req.user!.id })
      .populate("dataSource", "name")
      .select("-raw");
    return res.status(200).json(queries);
  } catch (error) {
    logger.error("Failed to fetch queries:", error);
    return res.status(500).json({ message: "Failed to fetch queries", error });
  }
};

// Get a single query by ID
export const getQueryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = await Query.findOne({
      _id: id,
      createdBy: req.user!.id,
    }).select("-raw");

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    return res.status(200).json(query);
  } catch (error) {
    logger.error("Failed to fetch query:", error);
    return res.status(500).json({ message: "Failed to fetch query", error });
  }
};

// Get queries by data source
export const getQueriesByDataSource = async (req: Request, res: Response) => {
  const { dataSourceId } = req.params;

  try {
    // Find queries where the data source matches the provided id and the user is authenticated
    const queries = await Query.find({
      dataSource: dataSourceId,
      createdBy: req.user!.id, // Only fetch queries created by the authenticated user
    });

    if (!queries || queries.length === 0) {
      return res
        .status(404)
        .json({ message: "No queries found for this data source" });
    }

    return res.status(200).json(queries);
  } catch (error) {
    logger.error("Failed to fetch queries:", error);
    return res.status(500).json({ message: "Failed to fetch queries", error });
  }
};

// Update a query
export const updateQuery = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, dataSource } = req.body;

  try {
    let query = await Query.findOne({ _id: id, createdBy: req.user!.id });
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // Update the query with the new description if it has been updated
    if (description !== query.description || dataSource !== query.dataSource) {
      query.description = description;

      // Fetch the associated data source
      const dataSource = await DataSource.findById(query.dataSource);
      if (!dataSource) {
        return res.status(404).json({ message: "Data source not found" });
      }

      if (dataSource.analysisInfo) {
        // Generate the new raw query based on the updated description and schema

        const rawQuery = await generateQueryUtil(
          description,
          dataSource.analysisInfo,
          dataSource.type
        );
        query.raw = rawQuery;
      }
    } else {
      query.name = name;
    }

    await query.save();

    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to update query:", error);
    return res.status(500).json({ message: "Failed to update query", error });
  }
};

// Delete a query
export const deleteQuery = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedQuery = await Query.findOneAndDelete({
      _id: id,
      createdBy: req.user!.id,
    });

    if (!deletedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }

    return res.status(200).json({ message: "Query deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete query:", error);
    return res.status(500).json({ message: "Failed to delete query", error });
  }
};

// Controller to execute a query based on the query ID
export const executeQuery = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = Number(req.query.pageSize) || 10; // Default to 10 items per page

  try {
    // Fetch the saved query
    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // Fetch the associated data source
    const dataSource = await DataSource.findById(query.dataSource);
    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    const queryExecutor = QueryExecutorFactory.getQueryExecutor(
      dataSource.type
    );
    const result = await queryExecutor.executeQuery(
      query.raw,
      dataSource,
      page,
      pageSize
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    logger.error("Failed to execute query:", error);
    return res.status(500).json({ message: "Failed to execute query", error });
  }
};
