import {Prisma} from "@prisma/client";
import {prisma} from "../prisma/prismaClient";
import securityUtil from "../utils/securityUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import {
	iCreateEmployeeDTO,
	iEmployeeUpdateDTO,
	iEmployeeResponse,
	iEmployeeData,
	iEmployeePaymentUpdateDTO,
	iEmployeeStats,
	iEmployeeStatsResponse,
	iEmployeeServiceStats,
} from "../customTypes/appDataTypes/employeeTypes";

export default class EmployeeService {
	/**
	 * Create a new employee along with a user entry.
	 */
	public async createEmployee(
		employeeBodyDTO: iCreateEmployeeDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			// if (!employeeBodyDTO.vendorId) {
			// 	return serviceUtil.buildResult(
			// 		false,
			// 		httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
			// 		genericServiceErrors.generic.InvalidCredentials
			// 	);
			// }
			// check roleId and statusId exist in the db or not
			const roleExists = await prisma.role.findUnique({
				where: {
					id: employeeBodyDTO.roleId || "13c0b54d-f6cb-11ef-a485-00163c34c678",
				},
			});
			const statusExists = await prisma.status.findUnique({
				where: {id: employeeBodyDTO.statusId},
			});

			if (!roleExists || !statusExists) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
					genericServiceErrors.errors.ValidationError
				);
			}

			// Hash password before storing
			if (employeeBodyDTO.password) {
				employeeBodyDTO.password = await securityUtil.hashPassword(
					employeeBodyDTO.password
				);
			}

			// Create user and employee in a single transaction to ensure both are created successfully if one fails, the other will also be rolled back.
			// This way, data integrity is maintained.
			const result = await prisma.$transaction(async (prisma) => {
				const user = await prisma.user.create({
					data: {
						id: securityUtil.generateUUID(),
						name: employeeBodyDTO.name,
						email: employeeBodyDTO.email,
						password: employeeBodyDTO.password, // Hash password before storing
						phoneNumber: employeeBodyDTO.phoneNumber,
						status: "active",
						roleId:
							employeeBodyDTO.roleId || "13c0b54d-f6cb-11ef-a485-00163c34c678",
					},
				});

				const employee = await prisma.employee.create({
					data: {
						id: securityUtil.generateUUID(),
						userId: user.id,
						designation: employeeBodyDTO.designation,
						joinedDate: new Date(employeeBodyDTO.joinedDate),
						statusId: employeeBodyDTO.statusId,
						vendorId:
							employeeBodyDTO.vendorId! ||
							"112538a1-aa00-417a-879a-48d444dcc5a2",
					},
				});

				return {user, employee};
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				result
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

	/**
	 * Get employee details by ID, including associated user information.
	 */
	public async getEmployeeById(
		employeeId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			const employee = await prisma.employee.findUnique({
				where: {id: employeeId},
				include: {
					users: true, // Fetch user details
					statuses: true,
				},
			});

			if (!employee) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotExist
				);
			}

			const employeeResponse: iEmployeeData = {
				id: employee.id,
				name: employee.users.name,
				email: employee.users.email || "",
				phoneNumber: employee.users.phoneNumber,
				joinedDate: employee.joinedDate,
				status: employee.statuses.name,
				designation: employee.designation,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				employeeResponse
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

	/*
	 * Get All employees list
	 */

	public async getAllEmployee(
		vendorId: string | undefined
	): Promise<iGenericServiceResult<iEmployeeResponse>> {
		try {
			if (!vendorId) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.InvalidCredentials
				);
			}
			const employeesData = await prisma.employee.findMany({
				where: {
					vendorId: vendorId,
					users: {
						status: "active",
					},
				},
				include: {
					users: true, // Fetch user details
					statuses: true,
				},
			});

			if (!employeesData) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotExist
				);
			}

			// Transform data into the required structure
			const employeeDetails: Record<string, iEmployeeData> = {};
			const ids: string[] = [];

			employeesData.forEach((employee) => {
				const employeeObj: iEmployeeData = {
					id: employee.id,
					name: employee.users.name,
					email: employee.users.email || "",
					phoneNumber: employee.users.phoneNumber,
					joinedDate: employee.joinedDate,
					status: employee.statuses.name,
					designation: employee.designation,
				};

				employeeDetails[employee.id] = employeeObj;
				ids.push(employee.id);
			});

			return serviceUtil.buildResult(true, httpStatusCodes.SUCCESS_OK, null, {
				employeeDetails,
				ids,
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

	/**
	 * Update employee and user details.
	 */
	public async updateEmployee(
		employeeId: string,
		updateData: iEmployeeUpdateDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			const existingEmployee = await prisma.employee.findUnique({
				where: {id: employeeId},
			});
			if (!existingEmployee) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotFound
				);
			}

			const result = await prisma.$transaction(async (prisma) => {
				const userUpdateData: any = {};
				const employeeUpdateData: any = {};

				if (updateData.name) userUpdateData.name = updateData.name;
				if (updateData.email) userUpdateData.email = updateData.email;
				if (updateData.mobileNumber)
					userUpdateData.phoneNumber = updateData.mobileNumber;
				if (updateData.roleId) userUpdateData.roleId = updateData.roleId;

				if (updateData.designation)
					employeeUpdateData.designation = updateData.designation;
				if (updateData.joinedDate)
					employeeUpdateData.joinedDate = new Date(updateData.joinedDate);
				if (updateData.statusId)
					employeeUpdateData.statusId = updateData.statusId;

				const user = await prisma.user.update({
					where: {id: existingEmployee.userId},
					data: userUpdateData,
				});

				const employee = await prisma.employee.update({
					where: {id: employeeId},
					data: employeeUpdateData,
				});

				return {user, employee};
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				result
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

	/**
	 * Soft delete employee by updating status (instead of actual deletion).
	 */
	public async deleteEmployee(
		employeeId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			const existingEmployee = await prisma.employee.findUnique({
				where: {id: employeeId},
			});
			if (!existingEmployee) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotFound
				);
			}
			const employee = await prisma.user.update({
				where: {id: existingEmployee.userId},
				data: {status: "inactive"}, // Soft delete logic
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				employee
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

	/**
	 * Get employee statistics including completed tasks and payment information
	 */
	public async getEmployeeStats(
		vendorId: string
	): Promise<iGenericServiceResult<iEmployeeStatsResponse>> {
		try {
			const employees = await prisma.employee.findMany({
				where: {
					vendorId: vendorId,
					users: {
						status: "active",
					},
				},
				include: {
					users: true,
					statuses: true,
					assignedEmployees: {
						where: {
							booking: {
								events: {
									eventDate: {
										lte: new Date(), // Only past events
									},
								},
							},
							isPaid: false, // Only unpaid services
						},
						include: {
							service: {
								include: {
									serviceRates: true,
								},
							},
							booking: {
								include: {
									events: true,
								},
							},
						},
					},
				},
			});

			const employeeStats: Record<string, iEmployeeStats> = {};
			const ids: string[] = [];

			for (const employee of employees) {
				const serviceStatsMap: Record<string, iEmployeeServiceStats> = {};

				// Process each assigned service
				for (const assigned of employee.assignedEmployees) {
					const serviceId = assigned.serviceId;
					const serviceName = assigned.service.serviceName;

					// Get service rate for this employee
					const serviceRate =
						assigned.service.serviceRates.find(
							(rate) => rate.employeeId === employee.id
						) ||
						assigned.service.serviceRates.find(
							(rate) => rate.employeeId === null
						);
					const serviceAmount = serviceRate ? Number(serviceRate.charge) : 0;

					if (!serviceStatsMap[serviceId]) {
						serviceStatsMap[serviceId] = {
							serviceId,
							serviceName,
							count: 0,
							totalAmount: 0,
							paidAmount: 0,
							remainingAmount: 0,
						};
					}

					const stats = serviceStatsMap[serviceId];
					stats.count++;
					stats.totalAmount += serviceAmount;
					stats.remainingAmount = stats.totalAmount - stats.paidAmount;
				}

				const employeeStat: iEmployeeStats = {
					employeeId: employee.id,
					name: employee.users.name,
					statusId: employee.statusId,
					status: employee.statuses.name,
					totalServices: Object.values(serviceStatsMap).reduce(
						(sum, stat) => sum + stat.count,
						0
					),
					totalAmount: Object.values(serviceStatsMap).reduce(
						(sum, stat) => sum + stat.totalAmount,
						0
					),
					totalPaid: Number(employee.totalPaid || 0),
					totalRemaining: Number(employee.totalRemaining || 0),
					extraAmount: Number(employee.extraAmount || 0),
					serviceStats: Object.values(serviceStatsMap),
				};

				employeeStats[employee.id] = employeeStat;
				ids.push(employee.id);
			}

			return serviceUtil.buildResult(true, httpStatusCodes.SUCCESS_OK, null, {
				employeeStats,
				ids,
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

	/**
	 * Update employee payment and mark services as paid
	 */
	public async updateEmployeePayment(
		paymentData: iEmployeePaymentUpdateDTO
	): Promise<iGenericServiceResult<any>> {
		console.log(paymentData.employeeId);
		try {
			const employee = await prisma.employee.findUnique({
				where: {id: paymentData.employeeId},
				include: {
					assignedEmployees: {
						include: {
							service: {
								include: {
									serviceRates: true,
								},
							},
							booking: {
								include: {
									events: true,
								},
							},
						},
					},
				},
			});

			if (!employee) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotFound
				);
			}

			const result = await prisma.$transaction(async (tx) => {
				// Create payment history record
				const paymentHistory = await tx.employeePaymentHistory.create({
					data: {
						id: securityUtil.generateUUID(),
						employeeId: paymentData.employeeId,
						amount: paymentData.amount,
						paidAt: paymentData.paidAt
							? new Date(paymentData.paidAt)
							: new Date(),
					},
				});

				let totalPaid = Number(employee.totalPaid || 0) + paymentData.amount;
				let extraAmount = Number(employee.extraAmount || 0);
				let remainingAmount = Number(employee.totalRemaining || 0);
				let remainingPayment = paymentData.amount;

				// First, handle any negative extraAmount from previous partial payments
				if (extraAmount < 0) {
					const amountToCover = Math.min(
						Math.abs(extraAmount),
						remainingPayment
					);
					extraAmount += amountToCover;
					remainingPayment -= amountToCover;
				}

				// Process assigned employees based on payment type
				if (paymentData.autoPaid) {
					// Sort by event date and mark as paid until amount is exhausted
					const sortedAssignments = [...employee.assignedEmployees]
						.filter((a) => !a.isPaid)
						.sort(
							(a, b) =>
								a.booking.events.eventDate.getTime() -
								b.booking.events.eventDate.getTime()
						);

					for (const assignment of sortedAssignments) {
						// Get service rate for this employee
						const serviceRate =
							assignment.service.serviceRates.find(
								(rate) => rate.employeeId === employee.id
							) ||
							assignment.service.serviceRates.find(
								(rate) => rate.employeeId === null
							);
						const serviceAmount = serviceRate ? Number(serviceRate.charge) : 0;

						if (remainingPayment >= serviceAmount) {
							await tx.assignedEmployee.update({
								where: {id: assignment.id},
								data: {
									isPaid: true,
									paidAt: new Date(),
								},
							});
							remainingPayment -= serviceAmount;
							remainingAmount -= serviceAmount;
						} else {
							break;
						}
					}
					// Any remaining payment goes to extra amount
					extraAmount += remainingPayment;
				} else if (paymentData.assignedEmployeeIds) {
					// For specific service payments, always mark as paid
					let totalServiceAmount = 0;
					for (const assignmentId of paymentData.assignedEmployeeIds) {
						const assignment = employee.assignedEmployees.find(
							(a) => a.id === assignmentId
						);
						if (assignment && !assignment.isPaid) {
							// Get service rate for this employee
							const serviceRate =
								assignment.service.serviceRates.find(
									(rate) => rate.employeeId === employee.id
								) ||
								assignment.service.serviceRates.find(
									(rate) => rate.employeeId === null
								);
							const serviceAmount = serviceRate
								? Number(serviceRate.charge)
								: 0;
							totalServiceAmount += serviceAmount;

							// Mark service as paid
							await tx.assignedEmployee.update({
								where: {id: assignmentId},
								data: {
									isPaid: true,
									paidAt: new Date(),
								},
							});
							remainingAmount -= serviceAmount;
						}
					}
					// Any remaining payment goes to extra amount
					extraAmount += remainingPayment - totalServiceAmount;
				} else {
					// If no specific services selected and no auto-pay, add to extra amount
					extraAmount += remainingPayment;
				}

				// Update employee payment totals
				const updatedEmployee = await tx.employee.update({
					where: {id: paymentData.employeeId},
					data: {
						totalPaid,
						totalRemaining: remainingAmount,
						extraAmount,
					},
				});

				return {paymentHistory, employee: updatedEmployee};
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				result
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

	/**
	 * Get assigned services for all employees with event details
	 */
	public async getEmployeeAssignedServices(
		vendorId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			const employees = await prisma.employee.findMany({
				where: {
					vendorId: vendorId,
					users: {
						status: "active",
					},
				},
				include: {
					users: true,
					assignedEmployees: {
						where: {
							isPaid: false,
						},
						include: {
							service: {
								include: {
									serviceRates: true,
								},
							},
							booking: {
								include: {
									events: true,
								},
							},
						},
						orderBy: {
							booking: {
								events: {
									eventDate: "desc",
								},
							},
						},
					},
				},
			});

			if (!employees.length) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotExist
				);
			}

			const formattedData = employees.map((employee) => {
				const assignedServices = employee.assignedEmployees.map((service) => {
					// Get service rate for this employee
					const serviceRate =
						service.service.serviceRates.find(
							(rate) => rate.employeeId === employee.id
						) ||
						service.service.serviceRates.find(
							(rate) => rate.employeeId === null
						);
					const serviceAmount = serviceRate ? Number(serviceRate.charge) : 0;

					return {
						assignedEmployeeId: service.id, // This is the unique ID from assigned_employees table
						serviceId: service.serviceId,
						serviceName: service.service.serviceName,
						amount: serviceAmount,
						eventDate: service.booking.events.eventDate,
						customerName: service.booking.events.customerName,
						location: service.booking.events.location,
						eventName: service.booking.events.eventName,
					};
				});

				return {
					employeeId: employee.id,
					employeeName: employee.users.name,
					assignedServices: assignedServices,
				};
			});

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				formattedData
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

	/**
	 * Get all assigned services for a specific employee
	 */
	public async getEmployeeServiceHistory(
		employeeId: string
	): Promise<iGenericServiceResult<any>> {
		try {
			const employee = await prisma.employee.findUnique({
				where: {id: employeeId},
				include: {
					users: true,
					assignedEmployees: {
						where: {
							booking: {
								events: {
									eventDate: {
										lt: new Date(), // Only past events
									},
								},
								bookingStatus: {
									name: {
										not: "cancelled",
									},
								},
							},
						},
						include: {
							service: {
								include: {
									serviceRates: true,
								},
							},
							booking: {
								include: {
									events: true,
									bookingStatus: true,
								},
							},
						},
						orderBy: {
							booking: {
								events: {
									eventDate: "desc",
								},
							},
						},
					},
				},
			});

			if (!employee) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					genericServiceErrors.generic.EmployeeDoesNotExist
				);
			}

			const assignedServices = employee.assignedEmployees.map((assignment) => {
				// Get service rate for this employee
				const serviceRate =
					assignment.service.serviceRates.find(
						(rate) => rate.employeeId === employeeId
					) ||
					assignment.service.serviceRates.find(
						(rate) => rate.employeeId === null
					);
				const serviceAmount = serviceRate ? Number(serviceRate.charge) : 0;

				return {
					assignedEmployeeId: assignment.id,
					serviceId: assignment.serviceId,
					serviceName: assignment.service.serviceName,
					amount: serviceAmount,
					eventDate: assignment.booking.events.eventDate,
					customerName: assignment.booking.events.customerName,
					location: assignment.booking.events.location,
					eventName: assignment.booking.events.eventName,
					isPaid: assignment.isPaid,
					paidAt: assignment.paidAt,
				};
			});

			return serviceUtil.buildResult(true, httpStatusCodes.SUCCESS_OK, null, {
				employeeId: employee.id,
				employeeName: employee.users.name,
				totalPaid: employee.totalPaid,
				totalRemaining: employee.totalRemaining,
				extraAmount: employee.extraAmount,
				assignedServices,
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
