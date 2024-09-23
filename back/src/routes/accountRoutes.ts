import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { getAccount, sendInvitation } from "../controllers/accountController";

const router = express.Router();

router.use(isAuthenticated);

// Get account details
router.get("/", getAccount);

// Send and invitation to join the account
router.post("/invite", sendInvitation);

export default router;
