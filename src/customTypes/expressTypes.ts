import {Router, Request, Response} from "express";

import {
	ParamsDictionary,
	Query,
	Send,
} from "../customTypes/expressServeStaticCore";
import {iGenericResponse} from "../customTypes/commonServiceTypes";
import {GenericNullable} from "../customTypes/commonTypes";

type RouteType = (apiRouter: Router) => void;

/**
 * Express Request interface with optional body
 * generic.
 *
 * NOTE: "T = void" makes the T generic optional. Which means
 * if the request doesn't have body, we can use just use
 * req: iRequest instead of req: iRequest<{}>
 */
interface iRequest<T = void> extends Request {
	body: T;
	user?: { id: string; email: string };
}

/**
 * Express Request interface with query generic.
 */
interface iRequestQuery<T extends Query> extends Request {
	query: T;
}

/**
 * Express Request interface with params generic.
 */
interface iRequestParams<T extends ParamsDictionary> extends Request {
	params: T;
}

/**
 * Express Request interface with params and body
 * generic.
 */
interface iRequestParamsWithBody<T extends ParamsDictionary, U = void>
	extends iRequest<U> {
	params: T;
}

/**
 * Express Response interface with ResDataType generic.
 */
interface iResponse<ResDataType> extends Response {
	json: Send<iGenericResponse<GenericNullable<ResDataType>>, this>;
}

export type {
	RouteType,
	iRequest,
	iRequestQuery,
	iRequestParams,
	iRequestParamsWithBody,
	iResponse,
};

export {};
