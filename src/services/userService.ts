import { response } from "express";
import {iUserRegisterDTO} from "../customTypes/appDataTypes/userTypes";
import { httpStatusCodes } from "../customTypes/networkTypes";

export default class UserService {
	public async signup(userBodyDTO: iUserRegisterDTO) {
        console.log("hello user")
        return(
            {
                httpStatusCode: httpStatusCodes.SUCCESS_CREATED,
                responseBody: {
                    message: "User created successfully",
                }
            }
        )
    }
}
