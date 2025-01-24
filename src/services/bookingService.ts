import {response} from "express";
import {iBookingCreateDTO} from "../customTypes/appDataTypes/bookingTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";

export default class BookingService {
	public async createBooking(
		bookingBodyDTO: iBookingCreateDTO
	): Promise<iGenericServiceResult<iBookingCreateDTO>> {
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
	}
}
