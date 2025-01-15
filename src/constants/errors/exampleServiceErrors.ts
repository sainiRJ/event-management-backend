import {asTypeIServiceError} from "@/customTypes/commonServiceTypes";

const exampleServiceErrors = asTypeIServiceError({
	example: {
		InvalidGreeting: {
			error: "InvalidGreeting",

			message: "Looks like you send an invalid greeting to me!",
		},
	},
});

export {exampleServiceErrors};
