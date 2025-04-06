import express, {Request, Response, NextFunction} from "express";
import cors, {CorsOptions} from "cors";
import apiRoutes from "../api/index";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {isCelebrateError} from "celebrate";
import Joi from "joi";
import serviceUtil from "../utils/serviceUtil";
import {
	ValidationErrorsType,
	iValidationErrorDetails,
} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

const celebrateValidationErrorHandler: express.ErrorRequestHandler = (
	err,
	req,
	res,
	next
) => {
	if (!isCelebrateError(err)) {
		return next(err);
	}

	const validationErrors: ValidationErrorsType = Array.from(
		err.details.entries()
	).reduce(
		(errors: Record<string, iValidationErrorDetails>, [segment, joiError]) => {
			return {
				...errors,
				[segment]: {
					source: segment,
					keys: joiError.details.map((detail: Joi.ValidationErrorItem) => {
						return detail.path[0];
					}),
					message: joiError.message,
				},
			};
		},
		{}
	);

	const {httpStatusCode, responseBody} = serviceUtil.buildResult(
		false,
		httpStatusCodes.CLIENT_ERROR_BAD_REQUEST,
		{
			...genericServiceErrors.errors.ValidationError,
			validationErrors,
		},
		null
	);

	// Ensure the response is ended by using res.status() and res.json(), not returning a response object
	res.status(httpStatusCode).json(responseBody).end();
};
const unAuthorizedErrorHandler: express.ErrorRequestHandler = (
	err,
	req,
	res,
	next
) => {
	/**
	 * Handle 401 thrown by express-jwt library
	 */
	if (err.name === "UnauthorizedError") {
		const {httpStatusCode, responseBody} = serviceUtil.buildResult(
			false,
			httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED,
			genericServiceErrors.auth.NoAuthorizationToken
		);

		// Send the response and ensure no value is returned
		res.status(httpStatusCode).json(responseBody).end();
		return;
	}

	// Pass to the next middleware if the error is not handled here
	next(err);
};

const loadExpress = ({app}: {app: express.Application}): void => {
	app.enable("trust proxy");
	console.log("Loading express...");

	const corsOptions: CorsOptions = {
		origin: ["http://localhost:3000", "http://23.94.233.79:3000", "http://192.169.0.141:3000"],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
		optionsSuccessStatus: 204,
	};
	// adds jwt token verify to each request
	// app.use(jwtTokenVerify);
	app.use(cors(corsOptions));
	app.use("/api", apiRoutes());
	// celebrate error handler.
	app.use(celebrateValidationErrorHandler);

	// Handle 401 thrown by express-jwt library
	app.use(unAuthorizedErrorHandler);
};

export default loadExpress;
