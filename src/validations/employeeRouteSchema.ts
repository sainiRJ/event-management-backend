import {Joi} from "celebrate"

const createEmployeeBodySchema = Joi.object({
    name: Joi.string()
    .min(2) // Adjust minimum length as per requirement
    .max(100)
    .required()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 100 characters",
    }),
    email: Joi.string()
	  .email()
	  .optional()
	  .messages({
		"string.email": "Please enter a valid email address",
	  }),
	  password: Joi.string()
	  .min(8) // Adjust minimum length as needed
	  .optional()
	  .messages({
		"string.min": "Password must be at least 8 characters long",
	  }),
	phoneNumber: Joi.string()
	  .pattern(/^\d{10}$/) // Assumes a 10-digit number format
	  .optional()
	  .messages({
		"string.pattern.base": "Mobile number must be a valid 10-digit number",
	  }),

	roleId: Joi.string()
	.optional()
	.messages({" any.required" : "roleId will be required"}),

	designation: Joi.string()
	.required()
	.messages({" any.required" : "designation will be required"}),

	salary: Joi.string()
	.required()
	.messages({" any.required" : "salary will be required"}),

	statusId: Joi.string()
	.required()
	.messages({" any.required" : "statusId will be required"}),
	
    joinedDate: Joi.date()
	.optional()
	.messages({" any.optional" : "joinedDate will be optional"}),

})

export {createEmployeeBodySchema}