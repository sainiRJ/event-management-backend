import {Joi} from "celebrate";

const bookingBodySchema = Joi.object({
	customerName: Joi.string().required().label("Customer Name"),
	phoneNumber: Joi.string()
		.pattern(/^[0-9]{10,15}$/)
		.required()
		.label("Phone Number"),
	email: Joi.string().email().required().label("Email Address"),
	eventDateTime: Joi.date().iso().required().label("Event Date and Time"),
	eventType: Joi.string().required().label("Event Type"),
	venueAddress: Joi.string().required().label("Venue Address"),
	decorationTheme: Joi.string().required().label("Decoration Theme"),
	additionalNotes: Joi.string().optional().allow("").label("Additional Notes"),
	budget: Joi.number().min(0).required().label("Budget"),
});

export {bookingBodySchema};
