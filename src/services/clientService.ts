import {prisma} from "../prisma/prismaClient";
import securityUtil from "../utils/securityUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import {
	iBookingRequestDTO,
	iContactMessageDTO,
} from "../customTypes/appDataTypes/clientTypes";
import {date} from "joi";

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
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			/*
				as it is booking request service so we put status pending
				so for make panding we take status id of booking context from status table
			*/
			const bookingRequest = await prisma.bookingRequest.create({
				data: {
					id: securityUtil.generateUUID(),
					name: bookingBodyDTO.name,
					phone: bookingBodyDTO.phoneNumber,
					email: bookingBodyDTO.email || "",
					serviceId: bookingBodyDTO.serviceId,
					statusId: "ddf760d9-f355-11ef-a485-00163c34c678",
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
			const serviceExist = await prisma.service.findFirst({
				where: {
					id: checkAvaialabilityDTO.serviceId,
				},
			});
			if (!serviceExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			const anyBookingExist = await prisma.bookings.findFirst({
				where: {
					serviceId: checkAvaialabilityDTO.serviceId,
					events: {
						eventDate: checkAvaialabilityDTO.date,
					},
				},
			});
			console.log(anyBookingExist);
			const available = {
				available: serviceExist.available
					? anyBookingExist
						? false
						: true
					: false,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				available
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async createContactMessage(
		contactMessageDTO: iContactMessageDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			const contactMessage = await prisma.contactMessage.create({
				data: {
					name: contactMessageDTO.name,
					mobile: contactMessageDTO.phoneNumber,
					message: contactMessageDTO.message,
					createdAt: new Date(),
				},
			});
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_CREATED,
				null,
				contactMessage
			);
		} catch (error) {
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
