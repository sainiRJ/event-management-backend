import {Joi} from "celebrate";

const bookingBodySchema = Joi.object({
	customerName: Joi.string().required().label("Customer Name"),
	phoneNumber: Joi.string()
		.pattern(/^[0-9]{10,15}$/)
		.required()
		.label("Phone Number"),
	eventDate: Joi.date().required().label("Event Date and Time"),
	serviceId: Joi.string().required().label("Event Type"),
	venueAddress: Joi.string().required().label("Venue Address"),
	decorationTheme: Joi.string().required().label("Decoration Theme"),
	additionalNotes: Joi.string().optional().label("Additional Notes"),
	budget: Joi.number().min(0).required().label("Budget"),
	advancePayment: Joi.number().min(0).optional().label("Advance Payment"),
	bookingStatusId: Joi.string().required(),
	paymentStatusId: Joi.string().required(),
	eventName: Joi.string().required(),
	assignedEmployeeIds: Joi.array().items(Joi.string().uuid()).optional(),
});

export {bookingBodySchema};
