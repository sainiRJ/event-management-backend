import {asTypeIServiceError} from "../../customTypes/commonServiceTypes";

const headerServiceErrors = asTypeIServiceError({
	header: {
		InvalidGreeting: {
			error: "InvalidHeaders",

			message: "Looks like you send an invalid header requests!",
		},
	},
});

export {headerServiceErrors};
