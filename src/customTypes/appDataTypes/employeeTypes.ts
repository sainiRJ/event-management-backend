import { NullableString } from "../commonTypes";
import { Decimal } from '@prisma/client/runtime/library';

export interface iCreateEmployeeDTO{
    name: string;
    email?: NullableString;
    password?: NullableString;
    phoneNumber: NullableString;
    roleId?: string;
    designation: string;
    salary: string;
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
    salary?: string;
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
    salary: Decimal;
    designation: string;
}

export interface iEmployeeResponse {
    employeeDetails: Record<string, iEmployeeData>;
    ids: string[];
}