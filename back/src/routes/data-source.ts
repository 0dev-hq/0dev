import express from "express";
import { isAuthenticated } from "../middlewares/auth-middleware";
import {
  createDataSource,
  getDataSources,
  getDataSourceById, // Add this
  updateDataSource,
  deleteDataSource,
  testDataSourceConnection,
  captureSchema,
  getDataSourceAnalysis,
  updateDataSourceAnalysis,
} from "../controllers/data-source-controller";
import { contextMiddleware } from "../middlewares/context-middleware";

const router = express.Router();

// Create a new data source
router.post("/", isAuthenticated(["editor"]), createDataSource);

// Get all data sources for the authenticated user
router.get("/", isAuthenticated(), getDataSources);

// Get the analysis of the specified data source
router.get("/:id/analysis", isAuthenticated(), getDataSourceAnalysis);

// Get a single data source by ID
router.get("/:id", isAuthenticated(), getDataSourceById);

// Update an existing data source
router.put("/:id", isAuthenticated(["editor"]), updateDataSource);

// Delete a data source
router.delete("/:id", isAuthenticated(["editor"]), deleteDataSource);

// Test connection to a data source
router.post(
  "/test-connection",
  isAuthenticated(["editor"]),
  testDataSourceConnection
);

// Capture schema for the specified data source
router.post("/analyze/:id", isAuthenticated(["editor"]), captureSchema);

// Update the analysis of the specified data source
router.put(
  "/:id/analysis",
  isAuthenticated(["editor"]),
  updateDataSourceAnalysis
);

router.use(contextMiddleware);

export default {
  path: "/api/data-source",
  router,
};
