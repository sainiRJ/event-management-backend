import {Joi} from "celebrate";
const photoBodySchema = Joi.object({
    serviceId: Joi.string().required(),
    photo: Joi.string().optional(),

})


export {photoBodySchema}