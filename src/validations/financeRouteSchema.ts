import { Joi } from "celebrate";

const monthlyIncomeBodySchema = Joi.object({
    toDate: Joi.string().optional(),
    fromDate: Joi.string().optional(),
    bookingStatusId: Joi.string().optional(),
    serviceId: Joi.string().optional(),
    paymentStatusId: Joi.string().optional()
})

export { monthlyIncomeBodySchema}