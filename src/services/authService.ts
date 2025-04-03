import {prisma} from "../prisma/prismaClient";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {iUserDTO} from "../customTypes/appDataTypes/authTypes";
import serviceUtil from "../utils/serviceUtil";
import securityUtil from "../utils/securityUtil";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import jwt from "jsonwebtoken";
import {config} from "../config/config";
import {response} from "express";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {promiseHooks} from "v8";

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
			const accessToken = jwt.sign(
				{id: user.id, email: user.email},
				config.JWT_SECRET,
				{expiresIn: "1h"}
			);

			const refreshToken = jwt.sign(
				{id: user.id, email: user.email},
				config.JWT_SECRET,
				{expiresIn: "7d"}
			);

			const tokenExpireDate = new Date();
			tokenExpireDate.setDate(tokenExpireDate.getDate() + 7);

			await prisma.refreshToken.create({
				data: {
					id: securityUtil.generateUUID(),
					userId: user.id,
					token: refreshToken,
					expiresAt: tokenExpireDate,
					createdAt: new Date(),
				},
			});

			const responseData = {
				user,
				token: {accessToken, refreshToken, tokenExpireDate},
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
			let hashedPassword: string = "";

			// Hash password before storing
			if (userData.password) {
				hashedPassword = await securityUtil.hashPassword(userData.password);
			}

			const user = await prisma.user.create({
				data: {
					id: securityUtil.generateUUID(),
					email: userData.email,
					name: userData.name,
					roleId: "13c0d05d-f6cb-11ef-a485-00163c34c678 ",
					status: "active",
					password: hashedPassword,
					phoneNumber: userData.phoneNumber,
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

	public async login(userData: {emailOrPhone: string; password: string}) {
		try {
			if (!userData) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.errors.SomethingWentWrong
				);
			}


			let emailOrPhone = userData.emailOrPhone;

			// If input is a phone number (digits only), add country code prefix
			if (/^\d{10}$/.test(emailOrPhone)) {
				emailOrPhone = `+91${emailOrPhone}`;
			}
			// Check if input is email or phone
			const user = await prisma.user.findFirst({
				where: {
					OR: [{email: emailOrPhone}, {phoneNumber: emailOrPhone}],
				},
			});

			if (!user) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			if (!user.password) {
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
			};

			// Generate a JWT token
			const accessToken = jwt.sign(
				{id: user.id, email: user.email},
				config.JWT_SECRET,
				{expiresIn: "1m"}
			);

			const refreshToken = jwt.sign(
				{id: user.id, email: user.email},
				config.JWT_SECRET,
				{expiresIn: "7d"}
			);

			const tokenExpireDate = new Date();
			tokenExpireDate.setDate(tokenExpireDate.getDate() + 7);

			await prisma.refreshToken.create({
				data: {
					id: securityUtil.generateUUID(),
					userId: user.id,
					token: refreshToken,
					expiresAt: tokenExpireDate,
					createdAt: new Date(),
				},
			});
			const responseData = {
				userResponse,
				token: {accessToken, refreshToken, tokenExpireDate},
			};

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

	public async userInfo(
		id: string | undefined,
		email: string | undefined
	): Promise<iGenericServiceResult<any>> {
		let userResponse: any;

		const userExist = await prisma.user.findUnique({
			where: {
				id: id,
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
		if (!userExist) {
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
				genericServiceErrors.generic.UserDoesNotExist
			);
		}

		userResponse = {
			userId: userExist.id,
			name: userExist.name,
			email: userExist.email,
			phoneNumber: userExist.phoneNumber,
			role: userExist.roles.roleName,
		};

		/*
	  		check user is employee or vendor
	  		if user is employee then send all other employee data
		*/
		if (userExist.roles.roleName === "employee") {
			const employee = await prisma.employee.findFirst({
				where: {
					userId: userExist.id,
				},
				select: {
					id: true,
					designation: true,
					salary: true,
					joinedDate: true,
					statuses: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			userResponse = {
				...userResponse,
				employeeId: employee?.id,
				salary: employee?.salary,
				designation: employee?.designation,
				joinedDate: employee?.joinedDate,
				status: employee?.statuses.name,
			};
		}


		try {
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				userResponse
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async getAccessToken(
		userDTO: any
	): Promise<iGenericServiceResult<any>> {
		try {
			const tokenData = await prisma.refreshToken.findFirst({
				where: {
					token: userDTO.token,
					userId: userDTO.id,
				},
			});

			let token: any;

			if (tokenData && tokenData.expiresAt > new Date()) {
				const accessToken = jwt.sign(
					{id: userDTO.id, email: userDTO.email},
					config.JWT_SECRET,
					{expiresIn: "1h"}
				);

				token = {accessToken};

				// const refreshToken = jwt.sign(
				// 	{id: userDTO.id, email: userDTO.email},
				// 	config.JWT_SECRET,
				// 	{expiresIn: "7d"}
				// );

				// const tokenExpireDate = new Date();
				// tokenExpireDate.setDate(tokenExpireDate.getDate() + 7);

				// token= {
				// 	accessToken,
				// 	refreshToken,
				// 	tokenExpireDate,

				// }

				// await prisma.refreshToken.update({
				// 	where: {
				// 		id: tokenData.id
				// 	},
				// 	data: {
				// 		id: securityUtil.generateUUID(),
				// 		token: refreshToken,
				// 		expiresAt: tokenExpireDate,
				// 	},
				// });
			}
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				token
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
