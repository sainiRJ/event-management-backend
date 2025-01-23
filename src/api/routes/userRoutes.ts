import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {userSignupBodySchema} from "../../validations/userRouteSchema";
import {
	iUserRegisterDTO,
	iUserRegisterResponse,
} from "../../customTypes/appDataTypes/userTypes";
import UserService from "../../services/userService";


const route = Router();
const userService = new UserService();
const userRoute: RouteType = (apiRouter) => {
	apiRouter.use("/user", route);
	route.post(
		"/signup",
		celebrate({
			[Segments.BODY]: userSignupBodySchema, // User schema for validation
		}),
		async (
			req: iRequest<iUserRegisterDTO>,
			res: iResponse<iUserRegisterResponse>,
			next: NextFunction
		) => {
			// Let TypeScript infer the return type
			try {
				const {httpStatusCode, responseBody} = await userService.signup(
					req.body
				);
				res.status(httpStatusCode).json(responseBody); // Send the response, no return value
			} catch (error) {
				next(error); // Pass any errors to the next middleware (error handler)
			}
		}
	);
};

export default userRoute;
