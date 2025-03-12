import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Request, Response, NextFunction } from "express";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    (req as any).user = decoded; // Attach decoded user info to request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};
