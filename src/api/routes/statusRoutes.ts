import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import StatusService from "../../services/statusService";
const route = Router();

const statusService = new StatusService()

const statusRoute: RouteType = (apiRouter) => {
    apiRouter.use("/status", route);
    route.get(
        "/all",
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            // Let TypeScript infer the return type
            try {
                const {httpStatusCode, responseBody} = await statusService.allStatuses(
                );
                res.status(httpStatusCode).json(responseBody); // Send the response, no return value
            } catch (error) {
                next(error); // Pass any errors to the next middleware (error handler)
            }
        }
    );


};
export default statusRoute;
