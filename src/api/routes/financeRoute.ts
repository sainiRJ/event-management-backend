import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {monthlyIncomeBodySchema} from "../../validations/financeRouteSchema";
import FinanceService from "../../services/financeService";
import {Joi} from "celebrate";

const route = Router();

const financeService = new FinanceService();

const financeRoute: RouteType = (apiRouter) => {
	apiRouter.use("/finance", route);
	route.post(
		"/monthly/income",
		celebrate({
			[Segments.BODY]: monthlyIncomeBodySchema,
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} = await financeService.allFinance(
					req.body
				);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);
};

export default financeRoute;
