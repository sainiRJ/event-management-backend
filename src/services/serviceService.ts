import {response} from "express";
// import pool from "../config/database";
import {Prisma} from "@prisma/client";
import {prisma}  from "../prisma/prismaClient"

import {iService} from "../customTypes/appDataTypes/serviceTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class ServiceService {
	public async allService(): Promise<iGenericServiceResult<iService[]>> {
		try {
			const services = await prisma.service.findMany({
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
}
