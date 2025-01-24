import {
	iGenericServiceResult,
	iServiceError,
} from "../customTypes/commonServiceTypes";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {GenericNullable} from "../customTypes/commonTypes";

function buildResult<SuccessResultType>(
	isSuccess: boolean,
	httpStatusCode: httpStatusCodes,
	error: GenericNullable<iServiceError> = null,
	data: GenericNullable<SuccessResultType> = null
): iGenericServiceResult<SuccessResultType> {
	let errorObject = null;
	if (error) {
		errorObject = error;

		if (!errorObject.validationErrors) {
			errorObject.validationErrors = null;
		}
	}

	return {
		isSuccess,

		httpStatusCode,

		responseBody: {
			error: errorObject,
			data: data || null,
		},
	};
}

export default {
	buildResult,
};
