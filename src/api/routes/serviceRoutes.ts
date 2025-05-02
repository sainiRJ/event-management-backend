import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import ServiceService from "../../services/serviceService";
const route = Router();

const serviceService = new ServiceService()

const serviceRoute: RouteType = (apiRouter) => {
    apiRouter.use("/service", route);
    route.get(
        "/all",
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            // Let TypeScript infer the return type
            try {
                const {httpStatusCode, responseBody} = await serviceService.allService(
                );
                res.status(httpStatusCode).json(responseBody); // Send the response, no return value
            } catch (error) {
                next(error); // Pass any errors to the next middleware (error handler)
            }
        }
    );


};
export default serviceRoute;
