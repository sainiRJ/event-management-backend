import {NextFunction, Router} from "express";
import {Segments, celebrate, Joi} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import FinanceService from "../../services/financeService";
import {authenticateToken} from "../../middleware/authMiddleware";
import {httpStatusCodes} from "../../customTypes/networkTypes";
import {genericServiceErrors} from "../../constants/errors/genericServiceErrors";

const route = Router();
const financeService = new FinanceService();

const financeRoute: RouteType = (apiRouter) => {
	apiRouter.use("/finance", route);

	// Get all finance details with service-wise breakdown
	route.get(
		"/all",
		authenticateToken,
		celebrate({
			[Segments.QUERY]: Joi.object({
				fromDate: Joi.string().isoDate().optional(),
				toDate: Joi.string().isoDate().optional(),
				bookingStatusId: Joi.string().uuid().optional(),
				paymentStatusId: Joi.string().uuid().optional(),
				serviceId: Joi.string().uuid().optional(),
			}),
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} = await financeService.allFinance(
					req.query
				);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Get employee service assignments and billable amounts
	route.get(
		"/employee-services",
		authenticateToken,
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				if (!req.user?.id) {
					res.status(httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED).json({
						error: genericServiceErrors.generic.UnauthorizedAccess,
						data: null,
					});
					return;
				}
				const {httpStatusCode, responseBody} =
					await financeService.getEmployeeServiceAssignments(req.user.id);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);
};

export default financeRoute;
