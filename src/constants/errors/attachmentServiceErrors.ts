import {asTypeIServiceError} from "@/customTypes/commonServiceTypes";

const attachmentServiceErrors = asTypeIServiceError({
	generic: {
		SomethingWentWrong: {
			error: "SomethingWentWrong",
			message: "Something went wrong",
		},
	},

	issueBulkPreSignedUploadUrls: {
		NoFilesToUpload: {
			error: "NoFilesToUpload",
			message: "No files to upload",
		},

		InvalidAttachment: {
			error: "InvalidAttachment",
			message: "Invalid Attachment.",
		},
	},
});

export {attachmentServiceErrors};
