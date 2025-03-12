import { Joi } from "celebrate";

const userBodySchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(255).optional(),
  verified_email: Joi.boolean().optional(),
  picture: Joi.string().optional(),
  given_name: Joi.string().optional(),
  family_name: Joi.string().optional(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow(""),
  roleId: Joi.string().optional(),
//   status: Joi.string().valid("active", "inactive").default("active").label("Status"),
});

export { userBodySchema };
