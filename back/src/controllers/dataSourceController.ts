import { Request, Response } from "express";
import DataSource from "../models/DataSource"; // Import your DataSource model

import mongoose from "mongoose"; // MongoDB Client
import mysql from "mysql2/promise"; // MySQL Client
import {
  fetchMongoDBSchema,
  fetchMySQLSchema,
  fetchPostgreSQLSchema,
} from "./dataSourceSchemaUtil";
import logger from "../utils/logger";
import {
  validateAndConnectMySql,
  validateAndConnectPostgres,
} from "./dataSourceTestUtil";
// import axios from "axios"; // For WordPress and Google Sheets API requests

// Test connection to the data source
export const testDataSourceConnection = async (req: Request, res: Response) => {
  const { connectionString, type, username, password, apiKey, googleSheetId } =
    req.body;

  try {
    switch (type) {
      case "postgresql":
        const isPostgresConnected = await validateAndConnectPostgres(
          connectionString,
          username,
          password
        );
        return res.json({ success: isPostgresConnected });

      case "mongodb":
        // MongoDB connection with isolated connection instance
        const tempMongoConnection = await mongoose
          .createConnection(connectionString, {
            serverSelectionTimeoutMS: 5000, // Add any options you need here
          })
          .asPromise();

        await tempMongoConnection.close(); // Close the temporary connection
        return res.json({ success: true });

      case "mysql":
        const isMySqlConnected = await validateAndConnectMySql(
          connectionString,
          username,
          password
        );
        return res.json({ success: isMySqlConnected });
      // case "wordpress":
      //   // WordPress API connection
      //   const wpResponse = await axios.get(
      //     `${connectionString}/wp-json/wp/v2/posts`,
      //     {
      //       auth: {
      //         username: username,
      //         password: password,
      //       },
      //     }
      //   );
      //   if (wpResponse.status === 200) {
      //     return res
      //       .status(200)
      //       .json({ message: "WordPress connection successful" });
      //   }
      //   return res
      //     .status(wpResponse.status)
      //     .json({ message: "Failed to connect to WordPress API" });

      // case "googleSheet":
      //   // Google Sheets API connection
      //   const sheetResponse = await axios.get(
      //     `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}?key=${apiKey}`
      //   );
      //   if (sheetResponse.status === 200) {
      //     return res
      //       .status(200)
      //       .json({ message: "Google Sheets connection successful" });
      //   }
      //   return res
      //     .status(sheetResponse.status)
      //     .json({ message: "Failed to connect to Google Sheets" });

      default:
        return res
          .status(400)
          .json({ message: "Unsupported data source type" });
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

// Get all data sources for the authenticated user (excluding schemaInfo)
export const getDataSources = async (req: Request, res: Response) => {
  try {
    // Exclude the schemaInfo field by using projection
    const dataSources = await DataSource.find({
      createdBy: req.user!.id,
    }).select("-schemaInfo");

    return res.status(200).json(dataSources);
  } catch (error) {
    logger.error("Failed to retrieve data sources:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve data sources", error });
  }
};

// Get a single data source by ID (excluding schemaInfo)
export const getDataSourceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Exclude the schemaInfo field by using projection
    const dataSource = await DataSource.findOne({
      _id: id,
      createdBy: req.user!.id,
    }).select("-schemaInfo");

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

    // Fetch schema based on data source type
    let schema;
    switch (dataSource.type) {
      case "mongodb":
        schema = await fetchMongoDBSchema(dataSource);
        break;
      case "postgresql":
        schema = await fetchPostgreSQLSchema(dataSource);
        break;
      case "mysql":
        schema = await fetchMySQLSchema(dataSource);
        break;
      // Handle other types
      default:
        return res
          .status(400)
          .json({ message: "Unsupported data source type" });
    }

    // Save the schema and update the last updated time
    dataSource.schemaInfo = schema;
    dataSource.lastTimeAnalyzed = new Date(); // Set UTC time
    await dataSource.save();

    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to capture schema:", error);
    return res.status(500).json({ message: "Failed to capture schema", error });
  }
};
