import {asTypeIServiceError} from "../../customTypes/commonServiceTypes";

const genericServiceErrors = asTypeIServiceError({
	auth: {
		NoAuthorizationToken: {
			error: "NoAuthorizationToken",
			message: "No authorization token provided",
		},
	},

	errors: {
		ResourceNotFound: {
			error: "ResourceNotFound",

			message: "Resource Not Found",
		},

		ValidationError: {
			error: "ValidationError",

			message: "Validation Error",
		},

		SomethingWentWrong: {
			error: "SomethingWentWrong",
			message: "Something went wrong.",
		},
	},

	generic: {
		ServiceDoesNotExist: {
			error: "ServiceDoesNotExist",
			message: "Service does not exist",
		},
		StatusDoesNotExist: {
			error: "StatusDoesNotExist",
			message: "Status does not exist",
		},
		PaymentStatusDoesNotExist: {
			error: "PaymentStatusDoesNotExist",
			message: "Payment status does not exist",
		},
		BookingDoesNotExist: {
			error: "BookingDoesNotExist",
			message: "Booking does not exist",
		}
	}
});

export {genericServiceErrors};
