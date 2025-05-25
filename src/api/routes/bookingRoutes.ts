import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import {bookingBodySchema} from "../../validations/bookingRouteSchema";
import {iBookingCreateDTO} from "../../customTypes/appDataTypes/bookingTypes"
import BookingService from "../../services/bookingService";
import { authenticateToken } from "../../middleware/authMiddleware";
import {Joi} from "celebrate";
const route = Router();

const bookingService = new BookingService();

const bookingRoute: RouteType = (apiRouter) => {
    apiRouter.use("/booking", route);
    route.get(
            "/all",
            authenticateToken,
            async (
                req: iRequest<any>,
                res: iResponse<any>,
                next: NextFunction
            ) => {
                // Let TypeScript infer the return type
                try {
                    const userId = req.user?.id
                    const {httpStatusCode, responseBody} = await bookingService.allBooking(userId
                    );
                    res.status(httpStatusCode).json(responseBody); // Send the response, no return value
                } catch (error) {
                    next(error); // Pass any errors to the next middleware (error handler)
                }
            }
        );

    route.post(
        "/create",
        authenticateToken,
        celebrate({
            [Segments.BODY]: bookingBodySchema, // User schema for validation
        }),
        async (
            req: iRequest<iBookingCreateDTO>,
            res: iResponse<iBookingCreateDTO>,
            next: NextFunction
        ) => {
            // Let TypeScript infer the return type
            const bookingDTO = {
                ...req.body,
                userId: req.user?.id
            }
            try {
                const {httpStatusCode, responseBody} = await bookingService.createBooking(
                    bookingDTO
                );
                res.status(httpStatusCode).json(responseBody); // Send the response, no return value
            } catch (error) {
                next(error); // Pass any errors to the next middleware (error handler)
            }
        }
    );

    // path API
    route.patch(
        "/update/:bookingId",
        celebrate({
            [Segments.PARAMS]: Joi.object({
                bookingId: Joi.string().uuid().required()
            }),
            // [Segments.BODY]: bookingBodySchema,
        }),
        async (
            req: iRequest<iBookingCreateDTO>,
            res: iResponse<iBookingCreateDTO>,
            next: NextFunction
        ) => {
            // Let TypeScript infer the return type
            try {
                const {httpStatusCode, responseBody} = await bookingService.updateBooking(
                    req.params.bookingId,
                    req.body
                );
                res.status(httpStatusCode).json(responseBody); // Send the response, no return value
            } catch (error) {
                next(error); // Pass any errors to the next middleware (error handler)
            }
        }
    );

    // Delete Booking Route
    route.delete(
        "/delete/:bookingId",
        celebrate({
            [Segments.PARAMS]: Joi.object({
                bookingId: Joi.string().uuid().required()
            })
        }),
        async (
            req: iRequest<void>,
            res: iResponse<any>,
            next: NextFunction
        ) => {
            try {
                const { httpStatusCode, responseBody } = await bookingService.deleteBooking(
                    req.params.bookingId
                );
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    );

    // route.get(
    //     "/request",
    //     authenticateToken,
    //     async (
    //         req: iRequest<any>,
    //         res: iResponse<any>,
    //         next: NextFunction 
    //     ) => {
    //         try {
    //             const {httpStatusCode, responseBody} = await bookingService.getBookingRequest();
    //             res.status(httpStatusCode).json(responseBody);
    //         } catch (error) {
    //             next(error);
    //         }
    //     }
    // )
};

export default bookingRoute;