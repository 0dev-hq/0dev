import { IUser } from "../models/User";
declare global {
  namespace Express {
    interface User extends IUser {} // Extends the existing Express.User type with IUser fields
  }
}
