import express from "express";
import { isAuthenticated } from "../middlewares/auth-middleware";

import { contextMiddleware } from "../middlewares/context-middleware";
import { listActions } from "../controllers/agent-registry-controller";

const router = express.Router();

router.get("/action", isAuthenticated(["editor"]), listActions);

export default {
  path: "/api/agent-registry",
  router,
};
