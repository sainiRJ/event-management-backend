import {NullableString} from "../commonTypes";
import {Decimal} from "@prisma/client/runtime/library";

export interface iCreateEmployeeDTO {
	name: string;
	email?: NullableString;
	password?: NullableString;
	phoneNumber: NullableString;
	roleId?: string;
	designation: string;
	statusId: string;
	joinedDate: string;
	vendorId: string | undefined;
}

export interface iEmployeeUpdateDTO {
	name?: NullableString;
	email?: NullableString;
	password?: NullableString;
	mobileNumber?: NullableString;
	roleId?: string;
	designation?: string;
	statusId?: string;
	joinedDate?: string;
}

export interface iEmployeeData {
	id: string;
	name: string;
	email?: NullableString;
	phoneNumber: NullableString;
	joinedDate: Date;
	status: string;
	designation: string;
}

export interface iEmployeeResponse {
	employeeDetails: Record<string, iEmployeeData>;
	ids: string[];
}

export interface iEmployeePaymentUpdateDTO {
	employeeId: string;
	amount: number;
	paidAt?: string;
	autoPaid?: boolean;
	assignedEmployeeIds?: string[];
}

export interface iEmployeeServiceStats {
	serviceId: string;
	serviceName: string;
	count: number;
	totalAmount: number;
	paidAmount: number;
	remainingAmount: number;
}

export interface iEmployeeStats {
	employeeId: string;
	name: string;
	statusId: string;
	status: string;
	totalServices: number;
	totalAmount: number;
	totalPaid: number;
	totalRemaining: number;
	extraAmount: number;
	serviceStats: iEmployeeServiceStats[];
}

export interface iEmployeeStatsResponse {
	employeeStats: Record<string, iEmployeeStats>;
	ids: string[];
}
