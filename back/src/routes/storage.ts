import multer from "multer";
import { storageController } from "../controllers/storage-controller";
import { isAuthenticated } from "../middlewares/auth-middleware";
import { Router } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", isAuthenticated(), storageController.listFiles);
router.post(
  "/",
  isAuthenticated(),
  upload.single("file"),
  storageController.uploadFile
);
router.delete(
  "/:file",
  isAuthenticated(["editor"]),
  storageController.deleteFile
);

router.get(
  "/download/:file",
  isAuthenticated(),
  storageController.downloadFile
);

router.post(
  "/ingest/:file",
  isAuthenticated(["editor"]),
  storageController.ingest
);

export default {
  path: "/api/file",
  router,
};
