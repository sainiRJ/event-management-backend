import { NextFunction, Router } from "express";
import { Segments, celebrate, Joi } from "celebrate";
import { RouteType, iRequest, iResponse } from "../../customTypes/expressTypes";
import { photoBodySchema } from "../../validations/photoRouteSchema";
import upload from "../../middleware/multer";
import PhotoService from "../../services/photoService";
const route = Router();

const photoService = new PhotoService();

const photoRoute: RouteType = (apiRouter) => {
    apiRouter.use("/photo", route);
    route.post(
        "/upload",
        upload.single("photo"),
        celebrate({
            [Segments.BODY]: photoBodySchema
        }),
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction 
        ) => {
            try {
                const { serviceId } = req.body;
                const { httpStatusCode, responseBody } = await photoService.uploadPhoto(
                   { serviceId,
                    file: req.file}
                ); 
                res.status(httpStatusCode).json(responseBody); 
            } catch (error) {
                next(error); 
            }
        }
    )

    route.get(
        "",
        async (
            req: iRequest<any>,
            res: iResponse<any>,
            next: NextFunction  
        ) => {
            try {
                const { httpStatusCode, responseBody } = await photoService.getPhotos();
                res.status(httpStatusCode).json(responseBody);
            } catch (error) {
                next(error);
            }
        }
    )

}

export default photoRoute;