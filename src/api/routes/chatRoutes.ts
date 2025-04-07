import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import ChatService from "../../services/chatService"
import {authenticateToken} from "../../middleware/authMiddleware";
import {Joi} from "celebrate";
const route = Router();

const chatService = new ChatService();
const chatRoute: RouteType = (apiRouter) =>{
	apiRouter.use("/chat", route);
	route.post(
		"",
		celebrate({
			[Segments.BODY]: Joi.object({
				message: Joi.string().required(),
			}),
		}),
		 async (
					req: iRequest<any>,
					res: iResponse<any>,
					next: NextFunction
				)  => {
			try {
				const {message} = req.body;
				const {httpStatusCode, responseBody}= await chatService.generateResponse(message);
				res.status(httpStatusCode).json(responseBody);
			} catch (error: any) {
				next(error); 
			}
		}
	);
}


export default chatRoute;
