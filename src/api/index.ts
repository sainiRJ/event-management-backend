import {Router} from "express";
import userRoutes from './routes/userRoutes';
import bookingRoute from "./routes/bookingRoutes";


const getRouter = (): Router => {
	const apiRouter = Router();

	// connecting all api routes
	userRoutes(apiRouter);
	bookingRoute(apiRouter);

	return apiRouter;
};

export default getRouter;
