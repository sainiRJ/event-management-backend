import { prisma } from "../prisma/prismaClient";
import { httpStatusCodes } from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import { genericServiceErrors } from "../constants/errors/genericServiceErrors";
import fetch from "node-fetch";

export default class AuthService {
  public async authenticateUser(authorizationCode: string) {
    try {
      if (!authorizationCode) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
          "Authorization code is required"
        );
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: authorizationCode,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.OAUTH_REDIRECT_URI!,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
          "Failed to get access token"
        );
      }

      // Fetch user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }
      );

      const userData = await userInfoResponse.json();

      if (!userData.email) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
          "Failed to retrieve user info"
        );
      }

      // Upsert user in database
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: { name: userData.name, picture: userData.picture },
        create: {
          googleId: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        },
      });

      return serviceUtil.buildResult(
        true,
        httpStatusCodes.SUCCESS_OK,
        null,
        user
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
