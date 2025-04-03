import {Prisma} from "@prisma/client";
import {prisma} from "../prisma/prismaClient";
import securityUtil from "../utils/securityUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import {iMonthlyIncomeDTO} from "../customTypes/appDataTypes/financeTypes";

export default class FinanceService {
	public async allFinance(
		monthlyIncomeDTO: iMonthlyIncomeDTO
	): Promise<iGenericServiceResult<any>> {

		/*
			verify service, status, and payment_status exist or not
			Check status existence only if bookingStatusId is provided
		*/
		if (monthlyIncomeDTO.bookingStatusId) {
			const bookingStatusExist = await prisma.status.findUnique({
				where: {id: monthlyIncomeDTO.bookingStatusId},
			});

			if (!bookingStatusExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.StatusDoesNotExist
				);
			}
		}
		/*
			Check status existence only if paymentStatusId is provided
		*/
		if (monthlyIncomeDTO.paymentStatusId) {
			const paymentStatusExist = await prisma.status.findUnique({
				where: {id: monthlyIncomeDTO.paymentStatusId},
			});	
            if (!paymentStatusExist) {
            	return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.StatusDoesNotExist
				);
            }
		}

		/*
			Check service existence only if serviceId is provided
		*/
		if (monthlyIncomeDTO.serviceId) {
			const serviceExist = await prisma.service.findUnique({
				where: {id: monthlyIncomeDTO.serviceId},
			});

			if (!serviceExist) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}
		}

		// Build dynamic where clause
		const whereClause: any = {};

		const currentDate = new Date();
		const fromDate = monthlyIncomeDTO.fromDate
			? new Date(monthlyIncomeDTO.fromDate)
			: null;
		const toDate = monthlyIncomeDTO.toDate
			? new Date(monthlyIncomeDTO.toDate)
			: currentDate;

		whereClause.statusId = {
			not: "ddf77cb7-f355-11ef-a485-00163c34c678",
		};

		if (fromDate) {
			whereClause.events = {
				...whereClause.events,
				eventDate: {gte: fromDate},
			};
		}

		if (toDate) {
			whereClause.events = {
				...whereClause.events,
				eventDate: {...(whereClause.events?.eventDate || {}), lte: toDate},
			};
		}

		if (monthlyIncomeDTO.bookingStatusId) {
			whereClause.statusId.equals = monthlyIncomeDTO.bookingStatusId;
		}
        if(monthlyIncomeDTO.paymentStatusId) {
        	whereClause.paymentStatusId = monthlyIncomeDTO.paymentStatusId;
        }

		if (monthlyIncomeDTO.serviceId) {
			whereClause.serviceId = monthlyIncomeDTO.serviceId;
		}

		const allIncome = await prisma.bookings.aggregate({
			_sum: {
				totalCost: true,
				advancePayment: true,
			},
			where: whereClause,
		});
		const responseData = {
			totalIncome: allIncome._sum.totalCost,
			totalAdvance: allIncome._sum.advancePayment,
		};
		try {
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
