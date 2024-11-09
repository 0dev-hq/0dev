import { Router } from "express";
import {
  saveReport,
  getReport,
  deleteReport,
  getReports,
  analyzeBlock,
} from "../controllers/report-controller";
import { isAuthenticated } from "../middlewares/auth-middleware";

const router = Router();

// Route to get all reports
router.get("/", isAuthenticated(), getReports);

// Save or update a report
router.post("/", isAuthenticated(["editor"]), saveReport);
router.put("/:id", isAuthenticated(["editor"]), saveReport);

// Analyze a block group
router.post("/:id/analyze/:index", isAuthenticated(["editor"]), analyzeBlock);

// Get a report by ID
router.get("/:id", isAuthenticated(), getReport);

// Delete a report by ID
router.delete("/:id", isAuthenticated(["editor"]), deleteReport);

export default {
  path: "/api/report",
  router,
};
