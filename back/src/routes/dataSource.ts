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
router.post("/", isAuthenticated, createDataSource);

// Get all data sources for the authenticated user
router.get("/", isAuthenticated, getDataSources);

// Get a single data source by ID
router.get("/:id", isAuthenticated, getDataSourceById);

// Update an existing data source
router.put("/:id", isAuthenticated, updateDataSource);

// Delete a data source
router.delete("/:id", isAuthenticated, deleteDataSource);

// Test connection to a data source
router.post("/test-connection", isAuthenticated, testDataSourceConnection);

// Capture schema for the specified data source
router.post("/analyze/:id", isAuthenticated, captureSchema);

export default router;
