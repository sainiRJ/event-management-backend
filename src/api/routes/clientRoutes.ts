import {NextFunction, Router} from "express";
import {Joi, Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {
	bookingRequestBodySchema,
	availabilityBodySchema,
	contactMessageSchema,
} from "../../validations/clientRouteSchema";
import {
	iBookingRequestDTO,
	iContactMessageDTO,
} from "../../customTypes/appDataTypes/clientTypes";
import ClientService from "../../services/clientService";
import {authenticateToken} from "../../middleware/authMiddleware";
import {checkAvailabilityTool} from "../../services/llmToolHandlers"

const route = Router();

const clientService = new ClientService();

const clientRoute: RouteType = (apiRouter) => {
	apiRouter.use("/client", route);
	route.post(
		"/request",
		celebrate({
			[Segments.BODY]: bookingRequestBodySchema,
		}),
		async (
			req: iRequest<iBookingRequestDTO>,
			res: iResponse<any>,
			next: NextFunction
		) => {
			try {
				const {httpStatusCode, responseBody} =
					await clientService.requestBooking(req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	route.post(
		"/available/request",
		celebrate({
			[Segments.BODY]: availabilityBodySchema,
		}),
		async (
			req: iRequest<iBookingRequestDTO>,
			res: iResponse<any>,
			next: NextFunction
		) => {
			try {
				const {httpStatusCode, responseBody} =
					await clientService.checkAvaialability(req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	route.post(
		"/contact",
		celebrate({
			[Segments.BODY]: contactMessageSchema,
		}),
		async (
			req: iRequest<iContactMessageDTO>,
			res: iResponse<any>,
			next: NextFunction
		) => {
			try {
				const {httpStatusCode, responseBody} =
					await clientService.createContactMessage(req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

		route.post(
		"/check-available",
		celebrate({
			[Segments.BODY]: Joi.object({
				serviceType: Joi.string(),
				date: Joi.string()
			}),
		}),
		async (
			req: iRequest<any>,
			res,
			next: NextFunction
		) => {
			try {
				const result =
					await checkAvailabilityTool(req.body);
				res.status(200).json(result);
			} catch (error) {
				next(error);
			}
		}
	);
};

export default clientRoute;
