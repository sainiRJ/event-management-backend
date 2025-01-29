import {response} from "express";
import {iBookingCreateDTO} from "../customTypes/appDataTypes/bookingTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import pool from "../config/database";


export default class BookingService {
	public async createBooking(
		bookingBodyDTO: iBookingCreateDTO
	): Promise<iGenericServiceResult<iBookingCreateDTO>> {
		try{
			console.log("hello booking");
			const responseBody = {
				message: "Booking created successfully",
			};
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				bookingBodyDTO
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
	public async allBooking(): Promise<iGenericServiceResult<any[]>> {
		try {
			const [booking] = await pool.execute(
				"Select * from Bookings"
			);
			console.log("hello service", booking);
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				booking as any
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
