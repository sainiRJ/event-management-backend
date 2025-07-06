import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {
	userSignupBodySchema,
	userProfileUpdateSchema,
} from "../../validations/userRouteSchema";
import {
	iUserRegisterDTO,
	iUserRegisterResponse,
} from "../../customTypes/appDataTypes/userTypes";
import UserService from "../../services/userService";
import {authenticateToken} from "../../middleware/authMiddleware";
import {httpStatusCodes} from "../../customTypes/networkTypes";
import {genericServiceErrors} from "../../constants/errors/genericServiceErrors";
import serviceUtil from "../../utils/serviceUtil";

const route = Router();
const userService = new UserService();
const userRoute: RouteType = (apiRouter) => {
	apiRouter.use("/user", route);

	// Get user profile
	route.get(
		"/profile",
		authenticateToken,
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const userId = req.user?.id;
				if (!userId) {
					const result = serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
						genericServiceErrors.generic.UnauthorizedAccess
					);
					res.status(result.httpStatusCode).json(result.responseBody);
					return;
				}
				const {httpStatusCode, responseBody} =
					await userService.getUserProfile(userId);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Update user profile
	route.put(
		"/profile",
		authenticateToken,
		celebrate({
			[Segments.BODY]: userProfileUpdateSchema,
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const userId = req.user?.id;
				if (!userId) {
					const result = serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
						genericServiceErrors.generic.UnauthorizedAccess
					);
					res.status(result.httpStatusCode).json(result.responseBody);
					return;
				}
				const {httpStatusCode, responseBody} =
					await userService.updateUserProfile(userId, req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

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
