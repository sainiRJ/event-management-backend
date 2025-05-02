import {httpStatusCodes} from "../customTypes/networkTypes";
import {GenericNullable, NullableString} from "../customTypes/commonTypes";

interface iValidationErrorDetails {
	source: string;
	keys: Array<string | number>;
	message: string;
}

type ValidationErrorsType = Record<string, iValidationErrorDetails>;



interface iServiceError {
	error: string;
	message: string;
	validationErrors?: ValidationErrorsType | null;
}

interface iServiceSuccess {
	message: string;
}



interface iGenericResponse<SuccessResultType> {
	error: GenericNullable<iServiceError>;
	data: GenericNullable<SuccessResultType>;
}

interface iGenericServiceResult<SuccessResultType> {
	isSuccess: boolean;
	httpStatusCode: httpStatusCodes;
	responseBody: iGenericResponse<SuccessResultType>;
}
type ServiceErrorMapType = {
	[key in string]: iServiceError;
};
type MultiServiceErrorMapTypeObject = {
	[key in string]: ServiceErrorMapType;
};
function asTypeIServiceError<T extends MultiServiceErrorMapTypeObject>(
	arg: T
): T {
	return Object.freeze<T>(arg);
}
export {asTypeIServiceError};


export type {
	iServiceError,
	iServiceSuccess,
	iGenericResponse,
	iGenericServiceResult,
	iValidationErrorDetails,
	ValidationErrorsType,
};
