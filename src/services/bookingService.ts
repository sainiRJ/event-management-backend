import {Prisma} from "@prisma/client";
import {prisma} from "../prisma/prismaClient";
import securityUtil from "../utils/securityUtil";
import {
	iBookingCreateDTO,
	iBookingUpdateDTO,
} from "../customTypes/appDataTypes/bookingTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class BookingService {
	public async createBooking(
		bookingBodyDTO: iBookingCreateDTO
	): Promise<iGenericServiceResult<iBookingCreateDTO>> {
		try {
			if (!bookingBodyDTO.userId) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			/*
			verify service, status, and payment_status exist or not
			*/
			const serviceExist = await prisma.service.findUnique({
				where: {
					id: bookingBodyDTO.serviceId,
				},
			});
			if (!serviceExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}
			const statusExist = await prisma.status.findUnique({
				where: {
					id: bookingBodyDTO.bookingStatusId,
				},
			});
			if (!statusExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.StatusDoesNotExist
				);
			}
			const paymentStatusExist = await prisma.status.findUnique({
				where: {
					id: bookingBodyDTO.paymentStatusId,
				},
			});
			if (!paymentStatusExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.PaymentStatusDoesNotExist
				);
			}

			const event = await prisma.event.create({
				data: {
					id: securityUtil.generateUUID(),
					customerName: bookingBodyDTO.customerName,
					phoneNumber: bookingBodyDTO.phoneNumber,
					eventDate: new Date(bookingBodyDTO.eventDate),
					eventName: bookingBodyDTO.eventName,
					location: bookingBodyDTO.venueAddress,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			await prisma.bookings.create({
				data: {
					id: securityUtil.generateUUID(),
					eventId: event.id,
					serviceId: bookingBodyDTO.serviceId,
					statusId: bookingBodyDTO.bookingStatusId,
					totalCost: bookingBodyDTO.budget,
					advancePayment: bookingBodyDTO.advancePayment,
					paymentStatusId: bookingBodyDTO.paymentStatusId,
					vendorId: bookingBodyDTO.userId,
				},
			});

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
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
	public async allBooking(
		userId: string | undefined
	): Promise<iGenericServiceResult<any[]>> {
		try {
			const bookings = await prisma.bookings.findMany({
				where: {
					vendorId: userId,
				},
				select: {
					id: true,
					totalCost: true,
					bookedAt: true,
					advancePayment: true,
					events: {
						select: {
							eventName: true,
							customerName: true,
							phoneNumber: true,
							location: true,
							eventDate: true,
						},
					},
					paymentStatus: {
						select: {
							id:true,
							name: true,
						},
					},
					bookingStatus: {
						select: {
							id:true,
							name: true,
						},
					},
					services: {
						select: {
							id:true,
							serviceName: true,
						},
					},
					payments: true,
				},
			});

			// If no bookings found, return an empty array

			// Transform the data to include the required fields
			const transformedBookings = bookings.map((booking) => ({
				id: booking.id,
				totalCost: booking.totalCost,
				advancePayment: booking.advancePayment,
				bookedAt: booking.bookedAt,
				bookingStatus: booking.bookingStatus.name,
				bookingStatusId:booking.bookingStatus.id,
				paymentStatus: booking.paymentStatus.name,
				paymentStatusId: booking.paymentStatus.id,
				serviceName: booking.services.serviceName,
				serviceId: booking.services.id,
				customerName: booking.events.customerName,
				phoneNumber: booking.events.phoneNumber,
				eventName: booking.events.eventName,
				eventDate: booking.events.eventDate,
				venueAddress: booking.events.location,
			}));

			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				transformedBookings
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
	public async updateBooking(
		bookingId: string,
		updateDTO: iBookingUpdateDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			// 1. Find existing booking with associated event
			const existingBooking = await prisma.bookings.findUnique({
				where: {id: bookingId},
				include: {events: true},
			});

			if (!existingBooking) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.BookingDoesNotExist
				);
			}

			// 2. Validate related entities if present in DTO
			if (updateDTO.serviceId) {
				const serviceExist = await prisma.service.findUnique({
					where: {id: updateDTO.serviceId},
				});
				if (!serviceExist) {
					return serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
						genericServiceErrors.generic.ServiceDoesNotExist
					);
				}
			}

			if (updateDTO.bookingStatusId) {
				const statusExist = await prisma.status.findUnique({
					where: {id: updateDTO.bookingStatusId},
				});
				if (!statusExist)
					return serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
						genericServiceErrors.generic.StatusDoesNotExist
					);
			}

			if (updateDTO.paymentStatusId) {

				const paymentStatusExist = await prisma.status.findUnique({
					where: {id: updateDTO.paymentStatusId},
				});
				if (!paymentStatusExist){

				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.PaymentStatusDoesNotExist
				);
			}
			}

			// 3. Prepare update data
			const eventUpdateData: any = {
				updatedAt: new Date(),
			};

			if (updateDTO.customerName)
				eventUpdateData.customerName = updateDTO.customerName;
			if (updateDTO.phoneNumber)
				eventUpdateData.phoneNumber = updateDTO.phoneNumber;
			if (updateDTO.eventDate)
				eventUpdateData.eventDate = new Date(updateDTO.eventDate);
			if (updateDTO.eventName) eventUpdateData.eventName = updateDTO.eventName;
			if (updateDTO.venueAddress)
				eventUpdateData.location = updateDTO.venueAddress;

			const bookingUpdateData: any = {};
			if (updateDTO.serviceId)
				bookingUpdateData.serviceId = updateDTO.serviceId;
			if (updateDTO.bookingStatusId) bookingUpdateData.statusId = updateDTO.bookingStatusId;
			if (updateDTO.paymentStatusId)
				bookingUpdateData.paymentStatusId = updateDTO.paymentStatusId;
			if (updateDTO.budget) bookingUpdateData.totalCost = updateDTO.budget;

			// 4. Perform atomic updates
			const [updatedEvent, updatedBooking] = await prisma.$transaction([
				prisma.event.update({
					where: {id: existingBooking.eventId},
					data: eventUpdateData,
				}),
				prisma.bookings.update({
					where: {id: bookingId},
					data: bookingUpdateData,
				}),
			]);

			// 5. Prepare response
			const responseData = {
				...updatedBooking,
				event: updatedEvent,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
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

	public async deleteBooking(
		bookingId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			// 1. Find existing booking
			const existingBooking = await prisma.bookings.findUnique({
				where: {id: bookingId},
			});

			if (!existingBooking) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.BookingDoesNotExist
				);
			}

			// 2. Perform atomic deletion of booking and associated event
			const [deletedBooking, deletedEvent] = await prisma.$transaction([
				prisma.bookings.delete({
					where: {id: bookingId},
				}),
				prisma.event.delete({
					where: {id: existingBooking.eventId},
				}),
			]);

			// 3. Prepare response
			const responseData = {
				message: "Booking deleted successfully",
				deletedBookingId: deletedBooking.id,
				deletedEventId: deletedEvent.id,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
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

	public async getBookingRequest(): Promise<iGenericServiceResult<any>> {
		try {
			const bookingRequest = await prisma.bookingRequest.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					location: true,
					notes: true,
					createdAt: true,
					date: true,
					service: {
						select: {
							serviceName: true,
							id: true,
						},
					},
					statuses: {
						select: {
							name: true,
							id: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc", // latest first
				},
			});
			const transformedBookingRequest = bookingRequest.map((booking) => ({
				id: booking.id,
				customerName: booking.name,
				email: booking.email,
				phoneNumber: booking.phone,
				eventDate: booking.date,
				location: booking.location,
				notes: booking.notes,
				bookingRequestAt: booking.createdAt,
				serviceName: booking.service.serviceName,
				serviceId: booking.service.id,
				statusName: booking.statuses.name,
				statusId: booking.statuses.id,
			}));
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				transformedBookingRequest
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
