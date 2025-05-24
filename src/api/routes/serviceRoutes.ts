import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import ServiceService from "../../services/serviceService";
import {authenticateToken} from "../../middleware/authMiddleware";
import {iCreateServiceDTO, iUpdateServiceDTO} from "../../customTypes/appDataTypes/serviceTypes";
import {serviceRouteSchema} from "../validation/serviceRouteSchema";

const route = Router();
const serviceService = new ServiceService();

const serviceRoute: RouteType = (apiRouter) => {
    apiRouter.use("/service", route);
    
    route.get(
        "/all",
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await serviceService.allService();
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    );

    route.post(
        "/create",
        authenticateToken,
        celebrate({
            [Segments.BODY]: serviceRouteSchema[Segments.BODY].create
        }),
        async (
            req: iRequest<iCreateServiceDTO>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await serviceService.createService({
                    ...req.body,
                    userId: (req as any).user.id
                });
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    );

    route.patch(
        "/update/:serviceId",
        authenticateToken,
        celebrate({
            [Segments.BODY]: serviceRouteSchema[Segments.BODY].update,
            [Segments.PARAMS]: serviceRouteSchema[Segments.PARAMS].serviceId
        }),
        async (
            req: iRequest<iUpdateServiceDTO>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await serviceService.updateService(
                    req.params.serviceId,
                    {
                        ...req.body,
                        userId: (req as any).user.id
                    }
                );
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    );

    route.delete(
        "/delete/:serviceId",
        authenticateToken,
        celebrate({
            [Segments.PARAMS]: serviceRouteSchema[Segments.PARAMS].serviceId
        }),
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const {httpStatusCode, responseBody} = await serviceService.deleteService(
                    req.params.serviceId,
                    (req as any).user.id
                );
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    );
};

export default serviceRoute;
