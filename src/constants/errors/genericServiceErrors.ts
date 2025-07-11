import {asTypeIServiceError} from "../../customTypes/commonServiceTypes";

const genericServiceErrors = asTypeIServiceError({
	auth: {
		NoAuthorizationToken: {
			error: "NoAuthorizationToken",
			message: "No authorization token provided",
		},

		FailedToAuthenticate:{
			error: "FailedToAuthenticate",
			message: "Failed to authenticate the token",
		},
		InvalidRefreshToken:{
			error: "InvalidRefreshToken",
			message: "Invalid Refresh Token",
		}
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
		},
		UserDoesNotExist: {
			error: "UserDoesNotExist",
			message: "User does not exist",
		},
		EmployeeDoesNotExist: {
			error: "EmployeeDoesNotExist",
			message: "Employee does not exist",
		},
		EmployeeDoesNotFound: {
			error: "EmployeeDoesNotFound",
			message: "Employee does not found",
		},
		RoleDoesNotExist: {
			error: "RoleDoesNotExist",
			message: "Role does not exist",
		},
		EmailAlreadyExists: {
			error: "EmailAlreadyExists",
            message: "Email already exists",
        },
		InvalidCredentials: {
			error: "InvalidCredentials",
			message: "Invalid Credentials"
		},
		ImageDoesNotExist: {
			error: "ImageDoesNotExist",
			message: "Image does not exist",
		},
		UnauthorizedAccess: {
			error: "UnauthorizedAccess",
			message: "You are not authorized to perform this action"
		}
	}
});

export {genericServiceErrors};
