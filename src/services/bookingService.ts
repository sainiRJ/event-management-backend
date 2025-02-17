import {Prisma} from "@prisma/client";
import {prisma}  from "../prisma/prismaClient"
import securityUtil from "../utils/securityUtil";
import {iBookingCreateDTO} from "../customTypes/appDataTypes/bookingTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";


export default class BookingService {
	public async createBooking(
		bookingBodyDTO: iBookingCreateDTO
	): Promise<iGenericServiceResult<iBookingCreateDTO>> {
		try{
			console.log("hello booking");
			const responseBody = {
				message: "Booking created successfully",
			}
			/*
			verify service, status, and payment_status exist or not
			*/
			const serviceExist = await prisma.service.findUnique({
				where: {
					id: bookingBodyDTO.serviceId
				}
			})
			if(!serviceExist){
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}
			const statusExist = await prisma.status.findUnique({
				where: {
					id: bookingBodyDTO.statusId
				}
			})
			if(!statusExist){
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.StatusDoesNotExist
				);
			}
			const paymentStatusExist = await prisma.status.findUnique({
				where: {
					id: bookingBodyDTO.paymentStatusId
				}
			})
			if(!paymentStatusExist){
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
						eventDate: new Date(bookingBodyDTO.eventDateTime),
						eventName: bookingBodyDTO.eventName,
						location: bookingBodyDTO.venueAddress,
						createdAt: new Date(),
						updatedAt: new Date(),
					}
				})

				await prisma.bookings.create({
					data:{
						id: securityUtil.generateUUID(),
						eventId: event.id,
						serviceId: bookingBodyDTO.serviceId,
						statusId: bookingBodyDTO.statusId,
						totalCost: bookingBodyDTO.budget,
						paymentStatusId: bookingBodyDTO.paymentStatusId
					}
				})

			
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
	public async allBooking(): Promise<iGenericServiceResult<any[]>> {
		try {
			const bookings = await prisma.bookings.findMany({
				select: {
					id: true,
					totalCost: true,
					bookedAt: true,
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
							name: true,
						},
					},
					bookingStatus: {
						select: {
							name: true,
						},
					},
					services:{
						select: {
							serviceName: true,
						},
					},
					payments: true,
				},
			});
    
            // If no bookings found, return an empty array
				
			// Transform the data to include the required fields
			const transformedBookings = bookings.map(booking => ({
				id: booking.id,
				totalCost: booking.totalCost,
				bookedAt: booking.bookedAt,
				bookingStatus: booking.bookingStatus.name,
				paymentStatus: booking.paymentStatus.name,
				serviceName: booking.services.serviceName,
				customerName: booking.events.customerName,
				phoneNumber: booking.events.phoneNumber,
				eventName: booking.events.eventName,
				eventDate: booking.events.eventDate,
				location: booking.events.location,
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
}
