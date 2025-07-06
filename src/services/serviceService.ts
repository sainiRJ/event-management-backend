import {response} from "express";
// import pool from "../config/database";
import {Prisma} from "@prisma/client";
import {prisma}  from "../prisma/prismaClient"

import {iService, iCreateServiceDTO, iUpdateServiceDTO} from "../customTypes/appDataTypes/serviceTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import securityUtil from "../utils/securityUtil";

export default class ServiceService {
	public async allService(): Promise<iGenericServiceResult<iService[]>> {
		try {
			const services = await prisma.service.findMany({
				where: {
					available: true
				},
				select: {
					id: true,
					serviceName: true,
					description: true,
					price: true,
					available: true,
				},
			});
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				services as iService[]
			);
		} catch (error: any) {
			console.log(error);
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async createService(
		serviceData: iCreateServiceDTO
	): Promise<iGenericServiceResult<iService>> {
		try {
			// Verify user exists and is a vendor
			const user = await prisma.user.findUnique({
				where: { id: serviceData.userId },
				include: {
					roles: true
				}
			});

			if (!user) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}
			

			if (user.roles.roleName !== "vendor") {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_FORBIDDEN,
					genericServiceErrors.generic.UnauthorizedAccess
				);
			}

			// Create the service
			const service = await prisma.service.create({
				data: {
					id: securityUtil.generateUUID(),
					serviceName: serviceData.serviceName,
					description: serviceData.description || null,
					price: new Prisma.Decimal(serviceData.price),
					available: serviceData.available,
					vendorId: user.id,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_CREATED,
				null,
				service as iService
			);
		} catch (error: any) {
			console.error(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async updateService(
		serviceId: string,
		updateData: iUpdateServiceDTO
	): Promise<iGenericServiceResult<iService>> {
		try {
			// Verify user exists and is a vendor
			const user = await prisma.user.findUnique({
				where: { id: updateData.userId },
				include: {
					roles: true
				}
			});

			if (!user) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			if (user.roles.roleName !== "vendor") {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_FORBIDDEN,
					genericServiceErrors.generic.UnauthorizedAccess
				);
			}

			// Check if service exists and belongs to the vendor
			const existingService = await prisma.service.findUnique({
				where: { id: serviceId }
			});

			if (!existingService) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}

			if (existingService.vendorId !== user.id) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_FORBIDDEN,
					genericServiceErrors.generic.UnauthorizedAccess
				);
			}

			// Prepare update data
			const updateFields: any = {
				updatedAt: new Date()
			};

			if (updateData.serviceName) updateFields.serviceName = updateData.serviceName;
			if (updateData.description !== undefined) updateFields.description = updateData.description;
			if (updateData.price !== undefined) updateFields.price = new Prisma.Decimal(updateData.price);
			if (updateData.available !== undefined) updateFields.available = updateData.available;

			// Update the service
			const updatedService = await prisma.service.update({
				where: { id: serviceId },
				data: updateFields
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				updatedService as iService
			);
		} catch (error: any) {
			console.error(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async deleteService(
		serviceId: string,
		userId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			// Verify user exists and is a vendor
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					roles: true
				}
			});

			if (!user) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.UserDoesNotExist
				);
			}

			if (user.roles.roleName !== "vendor") {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_FORBIDDEN,
					genericServiceErrors.generic.UnauthorizedAccess
				);
			}

			// Check if service exists and belongs to the vendor
			const existingService = await prisma.service.findUnique({
				where: { id: serviceId }
			});

			if (!existingService) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}

			if (existingService.vendorId !== user.id) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_FORBIDDEN,
					genericServiceErrors.generic.UnauthorizedAccess
				);
			}

			// Delete the service
			await prisma.service.delete({
				where: { id: serviceId }
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				{ message: "Service deleted successfully" }
			);
		} catch (error: any) {
			console.error(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
