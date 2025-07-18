import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {userBodySchema, userLoginBodySchema} from "../../validations/authRouteSchema"
import AuthService from "../../services/authService";
import { authenticateToken } from "../../middleware/authMiddleware";
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

    route.get(
        "/user",
        authenticateToken,
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            const id= req.user?.id
            const email = req.user?.email
            const {httpStatusCode, responseBody} = await authService.userInfo(id, email);
            res.status(httpStatusCode).json(responseBody);
        }
    )
    route.post(
        "/refresh-token",
        authenticateToken,
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            const token = req.cookies?.refresh_token
            const id= req.user?.id
            const email = req.user?.email
            const userData = {id, email, token}
            const {httpStatusCode, responseBody} = await authService.getAccessToken(userData);
            res.status(httpStatusCode).json(responseBody);
        }

    )
}


export default authRoute;