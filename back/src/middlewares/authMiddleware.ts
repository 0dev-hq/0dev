import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token with your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach the decoded user info to the request for further use
    req.user = decoded as any;

    next(); // Call the next middleware/controller function
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
