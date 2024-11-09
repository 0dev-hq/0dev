import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  account: string;
  role: string;
  plan: string;
}

/**
 * Middleware to check if the user is authenticated and optionally has one of the specified roles.
 *
 * @param {string[]} [roles=[]] - An optional array of roles that are allowed to access the route.
 * @returns {Function} - A middleware function that verifies the JWT token and checks user roles.
 *
 * @example
 * // Usage in an Express route
 * isAuthenticated(["editor"]) if the user's role is at least "editor"
 * or isAuthenticated() for any role
 *
 * @throws {401} - If no token is provided, the token is invalid
 */
export const isAuthenticated = (
  roles: string[] = [] // Optionally accept an array of roles
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      // Verify the token with your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Attach the decoded user info to the request for further use
      req.user = decoded as any;

      // If roles array is provided, check if the user has one of the allowed roles
      if (
        roles.length > 0 &&
        ![...roles, "admin"].includes(decoded.role.toLocaleLowerCase())
      ) {
        return res
          .status(403)
          .json({ message: "Unauthorized: Insufficient role" });
      }

      next(); // Call the next middleware/controller function
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};
