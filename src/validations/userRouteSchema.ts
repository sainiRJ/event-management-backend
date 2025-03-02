import {Joi} from "celebrate";

const userSignupBodySchema =Joi.object({
	name: Joi.string()
	  .min(2) // Adjust minimum length as per requirement
	  .max(100)
	  .optional()
	  .messages({
		"string.min": "Name must be at least 2 characters long",
		"string.max": "Name cannot exceed 100 characters",
	  }),
	email: Joi.string()
	  .email()
	  .required()
	  .messages({
		"string.email": "Please enter a valid email address",
		"any.required": "Email is required",
	  }),
	mobileNumber: Joi.string()
	  .pattern(/^\d{10}$/) // Assumes a 10-digit number format
	  .optional()
	  .messages({
		"string.pattern.base": "Mobile number must be a valid 10-digit number",
	  }),
	roleId: Joi.string()
	  .optional()
	  .messages({"any.optional": "roleId is optional"}),
	  
	password: Joi.string()
	  .min(8) // Adjust minimum length as needed
	  .optional()
	  .messages({
		"string.min": "Password must be at least 8 characters long",
	  }),
	confirmPassword: Joi.string()
	  .valid(Joi.ref("password"))
	  .optional()
	  .messages({
		"any.only": "Confirm password must match the password",
	  }),
  });

  const userLoginBodySchema=Joi.object({
	email: Joi.string()
	.email()
	.required()
	.messages({
	  "string.email": "Please enter a valid email address",
	  "any.required": "Email is required",
	}),
	password: Joi.string()
	  .min(8) 
	  .optional()
	  .messages({
		"string.min": "Password must be at least 8 characters long",
	  }),
  })

  const userChangePasswordValidateSchema=Joi.object({
	currentPassword: Joi.string()
	.optional()
	.messages({
	  "any.required": "current password is required",
	}),
	newPassword: Joi.string()
	.min(8) // Adjust minimum length as needed
	.optional()
	.messages({
	  "string.min": "Password must be at least 8 characters long",
	}),
   confirmedPassword: Joi.string()
	.valid(Joi.ref("newPassword"))
	.optional()
	.messages({
	  "any.only": "Confirm password must match the password",
	}),
  })

  const customerRegisterBodySchema =Joi.object({

	email: Joi.string()
	  .email()
	  .required()
	  .messages({
		"string.email": "Please enter a valid email address",
		"any.required": "Email is required",
	  }),
	password: Joi.string()
	  .min(8) // Adjust minimum length as needed
	  .optional()
	  .messages({
		"string.min": "Password must be at least 8 characters long",
	  }),
	confirmPassword: Joi.string()
	  .valid(Joi.ref("password"))
	  .optional()
	  .messages({
		"any.only": "Confirm password must match the password",
	  }),
  });

  const resetPasswordBodySchema =Joi.object({
	email: Joi.string()
	  .email()
	  .required()
	  .messages({
		"string.email": "Please enter a valid email address",
		"any.required": "Email is required",
	  }),
	otp: Joi.number()
	  .required()
	  .messages({
		"any.required": "Otp is required",
	  }),
	password: Joi.string()
	  .min(8) // Adjust minimum length as needed
	  .optional()
	  .messages({
		"string.min": "Password must be at least 8 characters long",
	  }),
	confirmPassword: Joi.string()
	  .valid(Joi.ref("password"))
	  .optional()
	  .messages({
		"any.only": "Confirm password must match the password",
	  }),
  });

export {customerRegisterBodySchema,userSignupBodySchema,userLoginBodySchema,userChangePasswordValidateSchema,resetPasswordBodySchema};
