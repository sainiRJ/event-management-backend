import {prisma} from "../prisma/prismaClient";
import securityUtil from "../utils/securityUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import {iBookingRequestDTO} from "../customTypes/appDataTypes/clientTypes";

export default class ClientService {
	public async requestBooking(
		bookingBodyDTO: iBookingRequestDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			/*
            verify service exist on not
            */
			const serviceExist = await prisma.service.findUnique({
				where: {
					id: bookingBodyDTO.serviceId,
				},
			});
			if (!serviceExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			const bookingRequest = await prisma.bookingRequest.create({
				data: {
					id: securityUtil.generateUUID(),
					name: bookingBodyDTO.name,
					phone: bookingBodyDTO.phoneNumber,
					email: bookingBodyDTO.email || "",
					serviceId: bookingBodyDTO.serviceId,
					location: bookingBodyDTO.location,
					date: new Date(bookingBodyDTO.date),
					notes: bookingBodyDTO.notes,
					createdAt: new Date(),
				},
			});
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_CREATED,
				null,
				bookingRequest
			);
		} catch (error) {
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async checkAvaialability(checkAvaialabilityDTO: {
		serviceId: string;
		date: Date;
	}): Promise<iGenericServiceResult<any>> {
		try {
			const serviceExist = await prisma.service.findUnique({
				where: {
					id: checkAvaialabilityDTO.serviceId,
				},
			});
			if (!serviceExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			const isBookingAvailable = await prisma.bookings.findFirst({
				where: {
					services: {
						available: true,
					},
				},
			});
			const available = {available: isBookingAvailable ? true : false};
			if (isBookingAvailable) {
				return serviceUtil.buildResult(
					true,
					httpStatusCodes.SUCCESS_OK,
					null,
					available
				);
			} else {
				return serviceUtil.buildResult(
					true,
					httpStatusCodes.SUCCESS_OK,
					null,
					available
				);
			}
		} catch (error) {
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
