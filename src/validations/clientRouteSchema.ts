import {Joi} from "celebrate";
import { date } from "joi";

const bookingRequestBodySchema = Joi.object({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().optional().label("Email"),
    phoneNumber: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .label("Phone Number"),
    date: Joi.date().required().label("Date"),
    serviceId: Joi.string().required().label("Service Id"),
    location: Joi.string().required().label("Location"),
    notes: Joi.string().optional().allow("").label("Notes"),
})

export {bookingRequestBodySchema}