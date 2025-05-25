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
		if (monthlyIncomeDTO.paymentStatusId) {
			whereClause.paymentStatusId = monthlyIncomeDTO.paymentStatusId;
		}

		if (monthlyIncomeDTO.serviceId) {
			whereClause.serviceId = monthlyIncomeDTO.serviceId;
		}
		console.log(whereClause);

		try {
			// Get total income and advance payment
			const allIncome = await prisma.bookings.aggregate({
				_sum: {
					totalCost: true,
					advancePayment: true,
				},
				where: whereClause,
			});

			// Get service-wise breakdown
			const serviceBreakdown = await prisma.bookings.groupBy({
				by: ["serviceId"],
				_sum: {
					totalCost: true,
					advancePayment: true,
				},
				where: whereClause,
			});

			// Get service details
			const serviceDetails = await prisma.service.findMany({
				where: {
					id: {
						in: serviceBreakdown.map((item) => item.serviceId),
					},
				},
				select: {
					id: true,
					serviceName: true,
				},
			});

			// Map service details to breakdown
			const serviceWiseData = serviceBreakdown.map((item) => {
				const service = serviceDetails.find((s) => s.id === item.serviceId);
				return {
					serviceId: item.serviceId,
					serviceName: service?.serviceName || "Unknown Service",
					totalCost: item._sum.totalCost || 0,
					advancePayment: item._sum.advancePayment || 0,
				};
			});

			const responseData = {
				totalIncome: allIncome._sum.totalCost || 0,
				totalAdvance: allIncome._sum.advancePayment || 0,
				serviceWiseData,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				responseData
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	public async getEmployeeServiceAssignments(
		vendorId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			// Get all employees with their service assignments and rates
			const employees = await prisma.employee.findMany({
				where: {
					vendorId: vendorId,
					users: {
						status: "active",
					},
				},
				include: {
					users: {
						select: {
							name: true,
						},
					},
					serviceRates: {
						include: {
							service: true,
						},
					},
					assignedEmployees: {
						include: {
							service: true,
						},
					},
				},
			});

			const employeeDetails = employees.map((employee) => {
				// Count service assignments
				const serviceCounts = new Map();
				employee.assignedEmployees.forEach((assignment) => {
					const count = serviceCounts.get(assignment.serviceId) || 0;
					serviceCounts.set(assignment.serviceId, count + 1);
				});

				// Get unique services with their counts and rates
				const services = Array.from(serviceCounts.entries()).map(
					([serviceId, count]) => {
						const serviceRate = employee.serviceRates.find(
							(rate) => rate.serviceId === serviceId
						);
						const service = serviceRate?.service;
						return {
							serviceId,
							serviceName: service?.serviceName || "",
							count,
							amount: serviceRate?.charge || 0,
						};
					}
				);

				// Calculate total amount
				const totalAmount = services.reduce(
					(sum, service) => sum + Number(service.amount) * service.count,
					0
				);

				return {
					employeeId: employee.id,
					employeeName: employee.users.name,
					totalServiceCount: employee.assignedEmployees.length,
					totalAmount,
					services,
				};
			});

			return serviceUtil.buildResult(true, httpStatusCodes.SUCCESS_OK, null, {
				employeeDetails,
			});
		} catch (error: any) {
			console.error(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}
}
