import { Request, Response } from "express";
import DataSource, { DataSourceType } from "../models/DataSource"; // Import your DataSource model
import logger from "../utils/logger";
import { SchemaAnalyzerFactory } from "../services/schema-analyzers/schemaAnalyzerFactory";
import { DataSourceConnectionValidatorFactory } from "../services/data-source-connection-validator/dataSourceConnectionValidatorFactory";
import { GenerativeAIProviderFactory } from "../services/generative-ai-providers/generativeAIProviderFactory";
import { SemanticLayerGeneratorFactory } from "../services/semantic-layer-generator/semanticLayerGeneratorFactory";

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
      createdBy: req.user!.id, // Add authenticated user
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
      createdBy: req.user!.id,
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
      createdBy: req.user!.id,
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
      { _id: id, createdBy: req.user!.id },
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
    const deletedDataSource = await DataSource.findOneAndDelete({
      _id: id,
      createdBy: req.user!.id,
    });

    if (!deletedDataSource) {
      return res.status(404).json({ message: "Data source not found" });
    }

    return res
      .status(200)
      .json({ message: "Data source deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete data source", error });
  }
};

// Capture schema for a data source
export const captureSchema = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dataSource = await DataSource.findOne({
      _id: id,
      createdBy: req.user!.id,
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

    const generativeAIProvider =
      GenerativeAIProviderFactory.getGenerativeAIProvider({
        provider: "openai",
        modelName: "gpt-4o-mini",
      });

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

    dataSource.analysisInfo = { schema };
    dataSource.lastTimeAnalyzed = new Date(); // Set UTC time
    await dataSource.save();

    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to capture schema:", error);
    return res.status(500).json({ message: "Failed to capture schema", error });
  }
};
