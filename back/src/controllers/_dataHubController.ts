// controllers/dataHubController.ts
import { Request, Response } from "express";
import DataHub from "../models/DataHub"; // Import your DataHub model
import logger from "../utils/logger";

// Create a new data hub
export const createDataHub = async (req: Request, res: Response) => {
  const { name, language, description } = req.body;

  try {
    const newDataHub = new DataHub({
      name,
      language,
      description,
      createdBy: req.user!.id, // Add authenticated user
    });

    await newDataHub.save();
    return res.status(201).json(newDataHub);
  } catch (error: any) {
    logger.error("Failed to create data hub:", error);
    return res
      .status(500)
      .json({ message: "Failed to create data hub", error });
  }
};

// Get all data hubs for the authenticated user
export const getDataHubs = async (req: Request, res: Response) => {
  try {
    const dataHubs = await DataHub.find({
      createdBy: req.user!.id,
    });

    return res.status(200).json(dataHubs);
  } catch (error) {
    logger.error("Failed to retrieve data hubs:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve data hubs", error });
  }
};

// Get a single data hub by ID
export const getDataHubById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dataHub = await DataHub.findOne({
      _id: id,
      createdBy: req.user!.id,
    });

    if (!dataHub) {
      return res.status(404).json({ message: "Data hub not found" });
    }

    return res.status(200).json(dataHub);
  } catch (error) {
    logger.error("Failed to fetch data hub:", error);
    return res.status(500).json({ message: "Failed to fetch data hub", error });
  }
};

// Update an existing data hub
export const updateDataHub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, language, description } = req.body;

  try {
    const updatedDataHub = await DataHub.findOneAndUpdate(
      { _id: id, createdBy: req.user!.id },
      { name, language, description },
      { new: true }
    );

    if (!updatedDataHub) {
      return res.status(404).json({ message: "Data hub not found" });
    }

    return res.status(200).json(updatedDataHub);
  } catch (error) {
    logger.error("Failed to update data hub:", error);
    return res
      .status(500)
      .json({ message: "Failed to update data hub", error });
  }
};

// Delete a data hub
export const deleteDataHub = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedDataHub = await DataHub.findOneAndDelete({
      _id: id,
      createdBy: req.user!.id,
    });

    if (!deletedDataHub) {
      return res.status(404).json({ message: "Data hub not found" });
    }

    return res.status(200).json({ message: "Data hub deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete data hub:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete data hub", error });
  }
};
