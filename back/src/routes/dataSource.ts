import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import {
  createDataSource,
  getDataSources,
  getDataSourceById, // Add this
  updateDataSource,
  deleteDataSource,
  testDataSourceConnection,
  captureSchema,
} from "../controllers/dataSourceController";

const router = express.Router();

router.use(isAuthenticated);

// Create a new data source
router.post("/", createDataSource);

// Get all data sources for the authenticated user
router.get("/", getDataSources);

// Get a single data source by ID
router.get("/:id", getDataSourceById);

// Update an existing data source
router.put("/:id", updateDataSource);

// Delete a data source
router.delete("/:id", deleteDataSource);

// Test connection to a data source
router.post("/test-connection", testDataSourceConnection);

// Capture schema for the specified data source
router.post("/analyze/:id", captureSchema);

export default router;
