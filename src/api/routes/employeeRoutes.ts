import {NextFunction, Router} from "express";
import {Segments, celebrate, Joi} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import EmployeeService from "../../services/employeeService";
import {createEmployeeBodySchema} from "../../validations/employeeRouteSchema";
import {authenticateToken} from "../../middleware/authMiddleware";
import serviceUtil from "../../utils/serviceUtil";
import {httpStatusCodes} from "../../customTypes/networkTypes";
import {genericServiceErrors} from "../../constants/errors/genericServiceErrors";

const route = Router();
const employeeService = new EmployeeService();

const employeeRoute: RouteType = (apiRouter) => {
	apiRouter.use("/employee", route);

	// Get All Employees
	route.get(
		"/all",
		authenticateToken,
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.getAllEmployee(req.user?.id);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Get Employee Statistics
	route.get(
		"/stats",
		authenticateToken,
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const vendorId = req.user?.id;
				if (!vendorId) {
					const result = serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
						genericServiceErrors.generic.InvalidCredentials
					);
					res.status(result.httpStatusCode).json(result.responseBody);
					return;
				}
				const {httpStatusCode, responseBody} =
					await employeeService.getEmployeeStats(vendorId);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Get Employee Assigned Services
	route.get(
		"/assigned-services",
		authenticateToken,
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const vendorId = req.user?.id;
				if (!vendorId) {
					const result = serviceUtil.buildResult(
						false,
						httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
						genericServiceErrors.generic.InvalidCredentials
					);
					res.status(result.httpStatusCode).json(result.responseBody);
					return;
				}
				const {httpStatusCode, responseBody} =
					await employeeService.getEmployeeAssignedServices(vendorId);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);
	// Create Employee
	route.post(
		"/create",
		celebrate({
			[Segments.BODY]: createEmployeeBodySchema,
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const employeeDTO = {
					...req.body,
					vendorId: req.user?.id,
				};
				const {httpStatusCode, responseBody} =
					await employeeService.createEmployee(employeeDTO);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	/**
	 * Get Employee by ID
	 */
	route.get(
		"/:id",
		celebrate({
			[Segments.PARAMS]: Joi.object({
				id: Joi.string().uuid().required(),
			}),
			[Segments.BODY]: Joi.object({}),
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.getEmployeeById(req.params.id);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Update Employee
	route.patch(
		"/update/:employeeId",
		celebrate({
			[Segments.PARAMS]: Joi.object({
				employeeId: Joi.string().uuid().required(),
			}),
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.updateEmployee(req.params.employeeId, req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Delete Employee
	route.delete(
		"/delete/:employeeId",
		celebrate({
			[Segments.PARAMS]: Joi.object({
				employeeId: Joi.string().uuid().required(),
			}),
		}),
		async (req: iRequest<void>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.deleteEmployee(req.params.employeeId);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);

	// Update Employee Payment
	route.patch(
		"/payment/update",
		authenticateToken,
		celebrate({
			[Segments.BODY]: Joi.object({
				employeeId: Joi.string().uuid().required(),
				amount: Joi.number().required(),
				paidAt: Joi.date().optional(),
				autoPaid: Joi.boolean().optional(),
				assignedEmployeeIds: Joi.array().items(Joi.string().uuid()).optional(),
			}),
		}),
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.updateEmployeePayment(req.body);
				res.status(httpStatusCode).json(responseBody);
			} catch (error) {
				next(error);
			}
		}
	);
};

export default employeeRoute;
