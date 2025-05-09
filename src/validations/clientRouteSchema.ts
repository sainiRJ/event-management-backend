import {Joi} from "celebrate";
import {date} from "joi";

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
});

const availabilityBodySchema = Joi.object({
	statusId: Joi.string().required().label("Service Id"),
	date: Joi.date().required().label("Date"),
});

const contactMessageSchema = Joi.object({
	name: Joi.string().required().min(2).max(100).label("Name"),
	phoneNumber: Joi.string()
		.pattern(/^[0-9]{10,15}$/)
		.required()
		.label("Mobile Number"),
	message: Joi.string().required().min(10).max(1000).label("Message"),
});

export {bookingRequestBodySchema, availabilityBodySchema, contactMessageSchema};
