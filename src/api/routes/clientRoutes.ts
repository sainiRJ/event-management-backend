import { NextFunction, Router } from "express";
import { Segments, celebrate } from "celebrate";
import { RouteType, iRequest, iResponse } from "../../customTypes/expressTypes";
import {bookingRequestBodySchema} from "../../validations/clientRouteSchema";4
import { iBookingRequestDTO } from "../../customTypes/appDataTypes/clientTypes";
import ClientService from "../../services/clientService";
import { authenticateToken } from "../../middleware/authMiddleware";
import { Joi } from "celebrate"

const route = Router();

const clientService = new ClientService();

const clientRoute: RouteType = (apiRouter) => {
    apiRouter.use("/client", route);
    route.post(
        "/request",
        celebrate({
            [Segments.BODY]: bookingRequestBodySchema 
            }),
        async (
            req: iRequest<iBookingRequestDTO>,
            res: iResponse<any>,
            next: NextFunction 
        ) => {
            try {
                const { httpStatusCode, responseBody } = await clientService.requestBooking(
                    req.body
                ); 
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error); 
            } 
        }
    );
}

export default clientRoute;
