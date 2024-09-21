import { Router } from "express";
import {
  saveReport,
  getReport,
  deleteReport,
  getReports,
  analyzeBlock,
} from "../controllers/reportController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();
router.use(isAuthenticated);

// Route to get all reports
router.get("/", getReports);

// Save or update a report
router.post("/", saveReport);
router.put("/:id", saveReport);

// Analyze a block group
router.post("/:id/analyze/:index", analyzeBlock);

// Get a report by ID
router.get("/:id", getReport);

// Delete a report by ID
router.delete("/:id", deleteReport);

export default router;
