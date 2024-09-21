import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import {
  createQuery,
  getQueries,
  getQueryById,
  updateQuery,
  deleteQuery,
  getQueriesByDataSource,
  executeQuery,
  buildQuery,
} from "../controllers/queryController";

const router = express.Router();

router.use(isAuthenticated);

// Create a new query
router.post("/", createQuery);

// Generate the raw query
router.post("/build/:id", buildQuery);

// Execute a query
router.post("/execute/:id", executeQuery);

// Get all queries for the authenticated user
router.get("/", getQueries);

// Get a single query by ID
router.get("/:id", getQueryById);

// Get all queries for a specified data source
router.get("/data-source/:dataSourceId", getQueriesByDataSource);

// Update a query
router.put("/:id", updateQuery);

// Delete a query
router.delete("/:id", deleteQuery);

export default router;
