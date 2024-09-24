import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import {
  activateUser,
  changeUserRole,
  deactivateUser,
  getAccount,
  sendInvitation,
} from "../controllers/accountController";

const router = express.Router();

router.use(isAuthenticated);

// Get account details
router.get("/", getAccount);

// Send and invitation to join the account
router.post("/invite", sendInvitation);

// Deactivate user
router.delete("/user/:id", deactivateUser);

// Activate user
router.put("/user/:id/activate", activateUser);

// Change user role
router.put("/user/:id/role", changeUserRole);

export default router;
