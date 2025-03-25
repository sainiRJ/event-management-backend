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
} from "../customTypes/appDataTypes/employeeTypes";


export default class EmployeeService {
	/**
	 * Create a new employee along with a user entry.
	 */
	public async createEmployee(
		employeeBodyDTO: iCreateEmployeeDTO
	): Promise<iGenericServiceResult<any>> {
		try {
			// check roleId and statusId exist in the db or not
			const roleExists = await prisma.role.findUnique({
                where: { id: employeeBodyDTO.roleId || "13c0b54d-f6cb-11ef-a485-00163c34c678" },
            });
            const statusExists = await prisma.status.findUnique({
                where: { id: employeeBodyDTO.statusId },
            });

            if (!roleExists ||!statusExists) {
                return serviceUtil.buildResult(
                    false,
                    httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
                    genericServiceErrors.errors.ValidationError
                );
            }

			// Hash password before storing
			if (employeeBodyDTO.password){
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
						roleId: employeeBodyDTO.roleId || "13c0b54d-f6cb-11ef-a485-00163c34c678",
					},
				});

				const employee = await prisma.employee.create({
					data: {
						id: securityUtil.generateUUID(),
						userId: user.id,
						designation: employeeBodyDTO.designation,
						salary: new Prisma.Decimal(employeeBodyDTO.salary),
						joinedDate: new Date(employeeBodyDTO.joinedDate),
						statusId: employeeBodyDTO.statusId,
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

			console.log(employee)

			const employeeResponse: iEmployeeData = ({
				id: employee.id,
				name: employee.users.name,
				email: employee.users.email || '',
				phoneNumber: employee.users.phoneNumber,
				joinedDate: employee.joinedDate,
				status: employee.statuses.name,
				salary: employee.salary,
				designation: employee.designation,
			})

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

	public async getAllEmployee(): Promise<iGenericServiceResult<iEmployeeResponse>>{
		try {
			const employeesData = await prisma.employee.findMany({
				where: {
					users:{
						status: "active"
					}
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

			console.log(employeesData)

			// Transform data into the required structure
			const employeeDetails: Record<string, iEmployeeData> = {};
			const ids: string[] = [];

			employeesData.forEach(employee => {
				const employeeObj: iEmployeeData = {
					id: employee.id,
					name: employee.users.name,
					email: employee.users.email || "",
					phoneNumber: employee.users.phoneNumber,
					joinedDate: employee.joinedDate,
					status: employee.statuses.name,
					salary: employee.salary,
					designation: employee.designation,
				};
	
				employeeDetails[employee.id] = employeeObj;
				ids.push(employee.id);
			});
			
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				{ employeeDetails, ids }
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
					genericServiceErrors.generic.EmployeeDoesNotFound,
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
				if (updateData.salary)
					employeeUpdateData.salary = new Prisma.Decimal(updateData.salary);
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
}
