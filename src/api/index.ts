import {Router} from "express";
import userRoutes from './routes/userRoutes';


const getRouter = (): Router => {
	const apiRouter = Router();

	// connecting all api routes
	userRoutes(apiRouter);

	return apiRouter;
};

export default getRouter;
