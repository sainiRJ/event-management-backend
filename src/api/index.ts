import {Router} from "express";
import userRoutes from "./routes/userRoutes";
import bookingRoute from "./routes/bookingRoutes";
import serviceRoute from "./routes/serviceRoutes";
import statusRoute from "./routes/statusRoutes";
import employeeRoute from "./routes/employeeRoutes";
import authRoute from "./routes/authRoutes";
import weatherRoute from "./routes/weatherRoutes";
import financeRoute from "./routes/financeRoutes";
import chatRoute from "./routes/chatRoutes";
import photoRoute from "./routes/photoRoutes";
import clientRoute from "./routes/clientRoutes";

const getRouter = (): Router => {
	const apiRouter = Router();

	// connecting all api routes
	userRoutes(apiRouter);
	bookingRoute(apiRouter);
	serviceRoute(apiRouter);
	statusRoute(apiRouter);
	employeeRoute(apiRouter);
	authRoute(apiRouter);
	weatherRoute(apiRouter);
	financeRoute(apiRouter);
	chatRoute(apiRouter);
	photoRoute(apiRouter);
	clientRoute(apiRouter);

	return apiRouter;
};

export default getRouter;
