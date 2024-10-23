// routes/dataHubRoutes.ts
import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import {
  createDataHub,
  getDataHubs,
  getDataHubById,
  updateDataHub,
  deleteDataHub,
} from "../controllers/_dataHubController";

const router = express.Router();

// Create a new data hub
router.post("/", isAuthenticated(["editor"]), createDataHub);

// Get all data hubs for the authenticated user
router.get("/", isAuthenticated(), getDataHubs);

// Get a single data hub by ID
router.get("/:id", isAuthenticated(), getDataHubById);

// Update an existing data hub
router.put("/:id", isAuthenticated(["editor"]), updateDataHub);

// Delete a data hub
router.delete("/:id", isAuthenticated(["editor"]), deleteDataHub);

export default {
  path: "/api/data-hub",
  router,
};
