import Joi from "joi";
import { Segments } from "celebrate";
import { iCreateServiceDTO, iUpdateServiceDTO } from "../../customTypes/appDataTypes/serviceTypes";

export const serviceRouteSchema = {
    [Segments.BODY]: {
        create: Joi.object<iCreateServiceDTO>({
            serviceName: Joi.string().required().min(3).max(100),
            description: Joi.string().optional().allow(null, ''),
            price: Joi.number().required().min(0),
            available: Joi.boolean().required()
        }),
        update: Joi.object<iUpdateServiceDTO>({
            serviceName: Joi.string().optional().min(3).max(100),
            description: Joi.string().optional().allow(null, ''),
            price: Joi.number().optional().min(0),
            available: Joi.boolean().optional()
        })
    },
    [Segments.PARAMS]: {
        serviceId: Joi.object({
            serviceId: Joi.string().required().uuid()
        })
    }
}; 