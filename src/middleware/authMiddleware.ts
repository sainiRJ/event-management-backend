import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Request, Response, NextFunction } from "express";
import { httpStatusCodes } from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import { genericServiceErrors } from "../constants/errors/genericServiceErrors";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.refresh_token;

  if (!token) { return res
    .status(httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED)
    .json(serviceUtil.buildResult(false, httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED, genericServiceErrors.auth.NoAuthorizationToken).responseBody);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    (req as any).user = decoded; // Attach decoded user info to request
    next();
  } catch (error) {
    console.log(error)
    return res
      .status(httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED)
      .json(serviceUtil.buildResult(false, httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED, genericServiceErrors.auth.FailedToAuthenticate).responseBody);
  }
};
