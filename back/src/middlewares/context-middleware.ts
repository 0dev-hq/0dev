import { Request, Response, NextFunction } from "express";

export function contextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user && req.user.account) {
    req.context = {
      filters: {
        owner: req.user.account,
      },
    };
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}
