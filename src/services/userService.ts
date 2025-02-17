import { response } from "express";
import {Prisma} from "@prisma/client";
import {prisma}  from "../prisma/prismaClient"

import {iUserRegisterDTO, iUserRegisterResponse} from "../customTypes/appDataTypes/userTypes";
import { httpStatusCodes } from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";



export default class UserService {
	public async signup(userBodyDTO: iUserRegisterDTO): Promise<iGenericServiceResult<iUserRegisterResponse>> {
        
        console.log("hello user")
        const responseBody = {
            name: "test",
            email: "test@gmail.com",
            mobile: "123456789"
            
        }
        // Return successful result
                return serviceUtil.buildResult(
                    true,
                    httpStatusCodes.SUCCESS_OK,
                    null,
                    responseBody
                );
    }
}
