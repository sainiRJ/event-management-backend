import {Router} from "express";
import userRoutes from './routes/userRoutes';
import bookingRoute from "./routes/bookingRoutes";
import serviceRoute  from "./routes/serviceRoutes";
import statusRoute from "./routes/statusRoutes"
import employeeRoute from "./routes/employeeRoutes";


const getRouter = (): Router => {
	const apiRouter = Router();

	// connecting all api routes
	userRoutes(apiRouter);
	bookingRoute(apiRouter);
	serviceRoute(apiRouter);
	statusRoute(apiRouter);
	employeeRoute(apiRouter);

	return apiRouter;
};

export default getRouter;
