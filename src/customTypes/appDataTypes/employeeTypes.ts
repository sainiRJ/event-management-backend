import { NullableString } from "../commonTypes";

export interface iCreateEmployeeDTO{
    name: string;
    email?: NullableString;
    password?: NullableString;
    mobileNumber: NullableString;
    roleId: string;
    designation: string;
    salary: string;
    statusId: string;
    joinedDate: string; 
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