import { Request, Response } from "express";
import DataSource, { DataSourceType } from "../models/data-source";
import logger from "../utils/logger";
import { SchemaAnalyzerFactory } from "../services/schema-analyzers/schema-analyzer-factory";
import { DataSourceConnectionValidatorFactory } from "../services/data-source-connection-validator/data-source-connection-validator-factory";
import { GenerativeAIProviderFactory } from "../services/generative-ai-providers/generative-ai-provider-factory";
import { SemanticLayerGeneratorFactory } from "../services/semantic-layer-generator/semantic-layer-generator-factory";
import { Client } from "pg";
import { AIModel } from "../services/generative-ai-providers/generative-ai-provider";

const generativeAIProvider =
  GenerativeAIProviderFactory.getGenerativeAIProvider({
    provider: process.env.GENERATIVE_AI_PROVIDER! as AIModel["provider"],
    modelName: process.env.GENERATIVE_AI_MODEL_NAME! as AIModel["modelName"],
  } as AIModel);

// Test connection to the data source
export const testDataSourceConnection = async (req: Request, res: Response) => {
  const { connectionString, type, username, password, apiKey, googleSheetId } =
    req.body;

  // check if the data source type is valid
  if (!Object.values(DataSourceType).includes(type)) {
    return res.status(400).json({ message: "Invalid data source type" });
  }

  try {
    const dataSourceConnectionValidator =
      DataSourceConnectionValidatorFactory.getValidator(type as DataSourceType);
    const isValid = await dataSourceConnectionValidator.validateConnection(
      req.body
    );

    if (isValid) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    logger.error("Failed to test data source connection:", error);
    return res.json({ success: false });
  }
};

// Create a new data source
export const createDataSource = async (req: Request, res: Response) => {
  const {
    type,
    name,
    connectionString,
    username,
    password,
    apiKey,
    googleSheetId,
  } = req.body;

  try {
    const newDataSource = new DataSource({
      type,
      name,
      connectionString,
      username,
      password,
      apiKey,
      googleSheetId,
      createdBy: req.user!.id,
      owner: req.user!.account,
    });

    await newDataSource.save();
    return res.status(201).json(newDataSource);
  } catch (error: any) {
    logger.error("Failed to create data source:", error);
    return res
      .status(500)
      .json({ message: "Failed to create data source", error });
  }
};

// Get all data sources for the authenticated user (excluding analysisInfo)
export const getDataSources = async (req: Request, res: Response) => {
  try {
    const dataSources = await DataSource.find({
      ...req.context?.filters,
    }).select("-analysisInfo");

    return res.status(200).json(dataSources);
  } catch (error) {
    logger.error("Failed to retrieve data sources:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve data sources", error });
  }
};

// Get a single data source by ID (excluding analysisInfo)
export const getDataSourceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Exclude the analysisInfo field by using projection
    const dataSource = await DataSource.findOne({
      _id: id,
      ...req.context?.filters,
    }).select("-analysisInfo");

    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    return res.status(200).json(dataSource);
  } catch (error) {
    logger.error("Failed to fetch data source:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch data source", error });
  }
};

// Update an existing data source
export const updateDataSource = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedDataSource = await DataSource.findOneAndUpdate(
      { _id: id, ...req.context?.filters },
      { ...req.body },
      { new: true }
    );

    if (!updatedDataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    return res.status(200).json(updatedDataSource);
  } catch (error) {
    logger.error("Failed to update data source:", error);
    return res
      .status(500)
      .json({ message: "Failed to update data source", error });
  }
};

// Delete a data source
export const deleteDataSource = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the data source to be deleted
    const dataSource = await DataSource.findOne({
      _id: id,
      ...req.context?.filters,
    });

    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    // If it's an imported data source, delete associated tables
    if (
      dataSource.type === DataSourceType.IMPORTED_CSV ||
      dataSource.type === DataSourceType.IMPORTED_EXCEL
    ) {
      logger.info(`dataSource: ${JSON.stringify(dataSource, null, 2)}`);
      const tableNames = dataSource.ingestionInfo?.tableNames || [];
      if (tableNames.length > 0) {
        const client = new Client({
          user: process.env.INTERNAL_DB_USER,
          password: process.env.INTERNAL_DB_PASS,
          host: process.env.INTERNAL_DB_HOST,
          port: Number(process.env.INTERNAL_DB_PORT),
          database: process.env.INTERNAL_DB_NAME,
        });

        try {
          await client.connect();
          for (const tableName of tableNames) {
            try {
              await client.query(
                `DROP TABLE IF EXISTS "${tableName}" CASCADE;`
              );
              console.log(`Dropped table: ${tableName}`);
            } catch (error) {
              console.error(`Failed to drop table: ${tableName}`, error);
              return res.status(500).json({
                message: `Failed to delete associated table: ${tableName}`,
                error,
              });
            }
          }
        } catch (dbError) {
          console.error("Failed to connect to the database", dbError);
          return res.status(500).json({
            message: "Failed to connect to the internal database",
            error: dbError,
          });
        } finally {
          await client.end();
        }
      }
    }

    // Delete the data source document
    const deletedDataSource = await DataSource.findOneAndDelete({
      _id: id,
      ...req.context?.filters,
    });

    if (!deletedDataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    return res.status(200).json({
      message: "Data source and associated tables deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting data source:", error);
    return res.status(500).json({
      message: "Failed to delete data source",
      error,
    });
  }
};

// Capture schema for a data source
export const captureSchema = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dataSource = await DataSource.findOne({
      _id: id,
      ...req.context?.filters,
    });

    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    // 1. Fetch schema based on data source type
    const schemaAnalyzer = SchemaAnalyzerFactory.getSchemaAnalyzer(
      dataSource.type
    );
    const schema = await schemaAnalyzer.fetchSchema(dataSource);

    console.log(`Schema: ${JSON.stringify(schema, null, 2)}`);

    // 2. Generate the Semantic Layer
    const semanticLayerGenerator =
      SemanticLayerGeneratorFactory.getSemanticLayerGenerator(
        dataSource.type,
        generativeAIProvider
      );
    const semanticLayer = await semanticLayerGenerator.generateSemanticLayer(
      schema
    );

    console.log(`Semantic Layer: ${JSON.stringify(semanticLayer, null, 2)}`);

    dataSource.analysisInfo = { schema, semanticLayer };
    dataSource.lastTimeAnalyzed = new Date(); // Set UTC time
    await dataSource.save();

    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to capture schema:", error);
    return res.status(500).json({ message: "Failed to capture schema", error });
  }
};

// Get the schema for a data source
export const getDataSourceAnalysis = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dataSource = await DataSource.findOne({
      _id: id,
      ...req.context?.filters,
    }).select("name type lastTimeAnalyzed analysisInfo");

    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    return res.status(200).json(dataSource);
  } catch (error) {
    logger.error("Failed to fetch data source schema:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch data source schema", error });
  }
};

// Update the analysis info for a data source with user revisions. This is a manual revision process.
export const updateDataSourceAnalysis = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { analysisInfo } = req.body;

  try {
    const dataSource = await DataSource.findOne({
      _id: id,
      ...req.context?.filters,
    });

    if (!dataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    if (!dataSource.analysisInfo) {
      return res
        .status(400)
        .json({ message: "Data source has not been analyzed yet" });
    }

    // Update analysis info fields with user-provided revisions
    dataSource.analysisInfo = analysisInfo;

    dataSource.lastTimeAnalyzed = new Date(); // Set to current UTC time
    await dataSource.save();

    return res.status(200).json({
      message: "Data source analysis updated successfully with user revisions",
      analysisInfo: dataSource.analysisInfo,
      lastTimeAnalyzed: dataSource.lastTimeAnalyzed,
    });
  } catch (error) {
    logger.error(
      "Failed to update data source analysis with user revisions:",
      error
    );
    return res
      .status(500)
      .json({ message: "Failed to update data source analysis", error });
  }
};
