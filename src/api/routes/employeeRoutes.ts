import {NextFunction, Router} from "express";
import {Segments, celebrate, Joi} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import EmployeeService from "../../services/employeeService";
import {createEmployeeBodySchema} from "../../validations/employeeRouteSchema";

const route = Router();
const employeeService = new EmployeeService();

const employeeRoute: RouteType = (apiRouter) => {
	apiRouter.use("/employee", route);

	// Get All Employees
	route.get(
		"/all",
		async (req: iRequest<any>, res: iResponse<any>, next: NextFunction) => {
			try {
				const {httpStatusCode, responseBody} =
					await employeeService.getAllEmployee();
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
				const {httpStatusCode, responseBody} =
					await employeeService.createEmployee(req.body);
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
};

export default employeeRoute;
