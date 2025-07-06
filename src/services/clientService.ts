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

			// Create event first
			const event = await prisma.event.create({
				data: {
					id: securityUtil.generateUUID(),
					customerName: bookingBodyDTO.name,
					phoneNumber: bookingBodyDTO.phoneNumber,
					email: bookingBodyDTO.email || null,
					eventName: "Booking Request",
					eventDate: new Date(bookingBodyDTO.date),
					location: bookingBodyDTO.location,
					createdAt: new Date(),
				},
			});

			// Get pending status IDs
			const pendingStatus = await prisma.status.findFirst({
				where: {
					context: "booking",
					name: "pending",
				},
			});

			if (!pendingStatus) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
					genericServiceErrors.errors.SomethingWentWrong
				);
			}

			// Create booking with client source
			const booking = await prisma.bookings.create({
				data: {
					id: securityUtil.generateUUID(),
					eventId: event.id,
					serviceId: bookingBodyDTO.serviceId,
					vendorId: serviceExist.vendorId,
					statusId: pendingStatus.id,
					paymentStatusId: pendingStatus.id,
					totalCost: 0, // Will be set by vendor later
					advancePayment: 0, // Will be set by vendor later
					isOnlineBooking: true,
					notes: bookingBodyDTO.notes,
					bookedAt: new Date(),
				},
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_CREATED,
				null,
				booking
			);
		} catch (error) {
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
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
