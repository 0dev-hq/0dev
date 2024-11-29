import { IUser } from "../models/user";
import * as multer from "multer";

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      file?: multer.File;
      files?: multer.File[];
      user?: User;
      context?: {
        filters?: {
          owner?: string;
        };
        limits?: {
          maxDataSources?: number;
        };
        subscription?: {
          type?: string;
        };
      };
    }
  }
}
