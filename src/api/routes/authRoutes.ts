import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import AuthService from "../../services/authService";
import {Joi} from "celebrate";
import { configDotenv } from "dotenv";

const route = Router();

const authService = new AuthService()

const authRoute: RouteType = (apiRouter) =>{
    apiRouter.use("/auth", route);
    route.get(
        "/google",
        celebrate({
            [Segments.BODY]: Joi.object({
                code: Joi.string().required(), 
            }),
        }),
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await authService.authenticateUser(  req.body
                );
                res.status(httpStatusCode).json(responseBody);
                
            } catch (error) {
                next(error);
            }
        }
    )
}