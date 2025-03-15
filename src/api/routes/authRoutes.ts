import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {userBodySchema, userLoginBodySchema} from "../../validations/authRouteSchema"
import AuthService from "../../services/authService";
import {Joi} from "celebrate";
import { configDotenv } from "dotenv";

const route = Router();

const authService = new AuthService()

const authRoute: RouteType = (apiRouter) =>{
    apiRouter.use("/auth", route);
    route.post(
        "/google/callback",
        celebrate({
            [Segments.BODY]: userBodySchema,
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

    route.post(
        "/signup",
        celebrate({
            [Segments.BODY]: userBodySchema,
        }),
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await authService.signup(  req.body
                );
                res.status(httpStatusCode).json(responseBody);
                
            } catch (error) {
                next(error);
            }
        }
    )

    route.post(
        "/login",
        celebrate({
            [Segments.BODY]: userLoginBodySchema,
        }),
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await authService.login(  req.body
                );
                res.status(httpStatusCode).json(responseBody);
                
            } catch (error) {
                next(error);
            }
        }
    )
}


export default authRoute;