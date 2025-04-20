import {NextFunction, Router} from "express";
import {Segments, celebrate} from "celebrate";
import {RouteType, iRequest, iResponse} from "../../customTypes/expressTypes";
import ChatService from "../../services/chatService"
import {authenticateToken} from "../../middleware/authMiddleware";
import {Joi} from "celebrate";
const route = Router();

const chatService = new ChatService();
// In-memory fallback chat history (per sessionId)
const chatSessions: Record<string, Array<{ role: 'user' | 'assistant', content: string }>> = {};
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
				// Generate or reuse session
				const id =  Math.random().toString(36).substring(2, 15);
				const chatHistory = chatSessions[id] || [];
			
				// Push user message to history
				chatHistory.push({ role: 'user', content: message });
			
				const {httpStatusCode, responseBody}= await chatService.generateResponse(message, chatHistory);
				res.status(httpStatusCode).json(responseBody);
			} catch (error: any) {
				next(error); 
			}
		}
	);
}


export default chatRoute;
