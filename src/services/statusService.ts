import {response} from "express";
import {Prisma} from "@prisma/client";
import {prisma}  from "../prisma/prismaClient"


import {iStatus} from "../customTypes/appDataTypes/statusTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class ServiceService {
	public async allStatuses(): Promise<iGenericServiceResult<iStatus[]>> {
		try {
			// const [statuses] = await pool.execute(
			// 	"Select id, name, context, description from statuses"
			// );
			const statuses = await prisma.status.findMany();
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				statuses as iStatus[]
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
