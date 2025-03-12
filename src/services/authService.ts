import { prisma } from "../prisma/prismaClient";
import { httpStatusCodes } from "../customTypes/networkTypes";
import {iUserDTO} from "../customTypes/appDataTypes/authTypes"
import serviceUtil from "../utils/serviceUtil";
import securityUtil from "../utils/securityUtil";
import { genericServiceErrors } from "../constants/errors/genericServiceErrors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { response } from "express";

export default class AuthService {
  public async authenticateUser(userData: iUserDTO) {
    try {
      if (!userData) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
          genericServiceErrors.errors.SomethingWentWrong
        );
      }
      console.log("userData", userData)

      if (!userData.email) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
          genericServiceErrors.generic.UserDoesNotExist
        );
      }

      let user = await prisma.user.findFirst({
        where: { email: userData.email ?? undefined  },
      });

      if (!user) {
        // Create the user if they do not exist
        user = await prisma.user.create({
          data: {
            id: securityUtil.generateUUID(),
            email: userData.email,
            name: userData.name,
            roleId: "13c0d05d-f6cb-11ef-a485-00163c34c678 ", 
            status: "active",
          },
        });
      }

      // Generate a JWT token (modify payload as per your requirements)
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET, 
        { expiresIn: "1h" }
      );

      const responseData =  {
        user,
        token,
      };
      
      return serviceUtil.buildResult(
        true,
        httpStatusCodes.SUCCESS_OK,
        null,
        responseData,
      );
    } catch (error) {
      console.error("Authentication error:", error);
      return serviceUtil.buildResult(
        false,
        httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
        genericServiceErrors.errors.SomethingWentWrong
      );
    }
  }
}
