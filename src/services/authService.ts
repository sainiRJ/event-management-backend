import {prisma} from "../prisma/prismaClient";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {iUserDTO} from "../customTypes/appDataTypes/authTypes";
import serviceUtil from "../utils/serviceUtil";
import securityUtil from "../utils/securityUtil";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import jwt from "jsonwebtoken";
import {config} from "../config/config";
import {response} from "express";

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
			console.log("userData", userData);

			if (!userData.email) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			let user = await prisma.user.findFirst({
				where: {email: userData.email ?? undefined},
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
				{id: user.id, email: user.email},
				config.JWT_SECRET,
				{expiresIn: "1h"}
			);

			const responseData = {
				user,
				token,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
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

	public async signup(userData: iUserDTO) {
		try {
			if (!userData) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.errors.SomethingWentWrong
				);
			}
			console.log("userData", userData);

			if (!userData.email) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			const emailExist = await prisma.user.findFirst({
				where: {email: userData.email ?? undefined},
			});

			if (emailExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.EmailAlreadyExists
				);
			}
        let hashedPassword: string = ""

        // Hash password before storing
        if(userData.password){

          hashedPassword = await securityUtil.hashPassword(
            userData.password
          );
        }
      

      const user = await prisma.user.create({
        data: {
          id: securityUtil.generateUUID(),
          email: userData.email,
          name: userData.name,
          roleId: "13c0d05d-f6cb-11ef-a485-00163c34c678 ",
          status: "active",
          password: hashedPassword,
          phoneNumber: userData.phone,
        },
      });

			const responseData = {message: "User cretaed successfully"};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
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

  public async login(userData: { emailOrPhone: string; password: string }) {
    try {
      if (!userData) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
          genericServiceErrors.errors.SomethingWentWrong
        );
      }

      console.log("Login request: ", userData);

      let emailOrPhone = userData.emailOrPhone;

      // If input is a phone number (digits only), add country code prefix
      if (/^\d{10}$/.test(emailOrPhone)) {
        emailOrPhone = `+91${emailOrPhone}`;
      }
      console.log(emailOrPhone)
      // Check if input is email or phone
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrPhone },
            { phoneNumber: emailOrPhone },
          ],
        },
      });

      if (!user) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
          genericServiceErrors.generic.UserDoesNotExist
        );
      }

      if(!user.password){
          return serviceUtil.buildResult(
            false,
            httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
            genericServiceErrors.generic.InvalidCredentials
          );  
      }

      // Verify password
      const isPasswordValid = await securityUtil.comparePassword(
        userData.password,
        user.password
      );
      if (!isPasswordValid) {
        return serviceUtil.buildResult(
          false,
          httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
          genericServiceErrors.generic.InvalidCredentials
        );
      }

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
      }

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const responseData = { userResponse, token };

      return serviceUtil.buildResult(
        true,
        httpStatusCodes.SUCCESS_OK,
        null,
        responseData
      );
    } catch (error) {
      console.error("Login error:", error);
      return serviceUtil.buildResult(
        false,
        httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
        genericServiceErrors.errors.SomethingWentWrong
      );
    }
  }
}
