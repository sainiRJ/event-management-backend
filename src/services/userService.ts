import {response} from "express";
import {Prisma} from "@prisma/client";
import {prisma} from "../prisma/prismaClient";

import {
	iUserRegisterDTO,
	iUserRegisterResponse,
} from "../customTypes/appDataTypes/userTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import securityUtil from "../utils/securityUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class UserService {
	public async signup(
		userBodyDTO: iUserRegisterDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			// check role exists or not
			const roleExists = await prisma.role.findUnique({
				where: {id: userBodyDTO.roleId},
			});

			if (!roleExists) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.RoleDoesNotExist
				);
			}
			//if roleId not in userBodyDTO, then add "13c0d05d-f6cb-11ef-a485-00163c34c678" in roleId
			if (!userBodyDTO.roleId) {
				userBodyDTO.roleId = "13c0d05d-f6cb-11ef-a485-00163c34c678";
			}

			// check email exists or not
			const emailExists = await prisma.user.findFirst({
				where: {email: userBodyDTO.email || undefined},
			});

			if (emailExists) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.EmailAlreadyExists
				);
			}

			// check password and confirmPassword match or not
			if (userBodyDTO.password !== userBodyDTO.confirmPassword) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.errors.ValidationError
				);
			}

			// Hash password before storing
			const hashedPassword = await securityUtil.hashPassword(
				userBodyDTO.password
			);

			const user = await prisma.user.create({
				data: {
					id: securityUtil.generateUUID(),
					name: userBodyDTO.name,
					email: userBodyDTO.email,
					phoneNumber: userBodyDTO.mobileNumber,
					password: hashedPassword,
					roleId: userBodyDTO.roleId,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				user
			);
		} catch (error: any) {
			console.log(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async getUserProfile(
		userId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: userId,
					status: "active",
				},
				select: {
					id: true,
					name: true,
					email: true,
					phoneNumber: true,
					roles: {
						select: {
							id: true,
							roleName: true,
						},
					},
				},
			});

			if (!user) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			const userResponse = {
				id: user.id,
				name: user.name,
				email: user.email,
				phoneNumber: user.phoneNumber,
				role: user.roles.roleName,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				userResponse
			);
		} catch (error) {
			console.error("Error fetching user profile:", error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async updateUserProfile(
		userId: string,
		updateData: {
			name?: string;
			phoneNumber?: string;
		}
	): Promise<iGenericServiceResult<any>> {
		try {
			// Check if user exists
			const userExists = await prisma.user.findUnique({
				where: {id: userId},
			});

			if (!userExists) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			// Update user profile
			const updatedUser = await prisma.user.update({
				where: {id: userId},
				data: {
					name: updateData.name,
					phoneNumber: updateData.phoneNumber,
					updatedAt: new Date(),
				},
				select: {
					id: true,
					name: true,
					email: true,
					phoneNumber: true,
					roles: {
						select: {
							id: true,
							roleName: true,
						},
					},
				},
			});

			const userResponse = {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				phoneNumber: updatedUser.phoneNumber,
				role: updatedUser.roles.roleName,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				userResponse
			);
		} catch (error) {
			console.error("Error updating user profile:", error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
