import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { getAccount } from "../controllers/accountController";

const router = express.Router();

router.use(isAuthenticated);

// Get account details
router.get("/", getAccount);
export default router;
