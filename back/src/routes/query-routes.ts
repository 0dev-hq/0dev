import express from "express";
import { isAuthenticated } from "../middlewares/auth-middleware";
import {
  createQuery,
  getQueries,
  getQueryById,
  updateQuery,
  deleteQuery,
  getQueriesByDataSource,
  executeQuery,
  buildQuery,
} from "../controllers/query-controller";
import { contextMiddleware } from "../middlewares/context-middleware";

const router = express.Router();

// Create a new query
router.post("/", isAuthenticated(["editor"]), createQuery);

// Generate the raw query
router.post("/build/:id", isAuthenticated(), buildQuery);

// Execute a query
router.post("/execute/:id", isAuthenticated(), executeQuery);

// Get all queries for the authenticated user
router.get("/", isAuthenticated(), getQueries);

// Get a single query by ID
router.get("/:id", isAuthenticated(), getQueryById);

// Get all queries for a specified data source
router.get(
  "/data-source/:dataSourceId",
  isAuthenticated(),
  getQueriesByDataSource
);

// Update a query
router.put("/:id", isAuthenticated(["editor"]), updateQuery);

// Delete a query
router.delete("/:id", isAuthenticated(["editor"]), deleteQuery);

router.use(contextMiddleware);

export default {
  path: "/api/query",
  router,
};
