import {response} from "express";
import pool from "../config/database";

import {iService} from "../customTypes/appDataTypes/serviceTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class ServiceService {
	public async allService(): Promise<iGenericServiceResult<iService[]>> {
		try {
			const [services] = await pool.execute(
				"Select id, service_name, description, price, available from Services"
			);
			console.log("hello service", services);
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
