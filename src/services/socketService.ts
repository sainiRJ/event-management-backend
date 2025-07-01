// SocketService.ts
import {Server, Socket} from "socket.io";
import {Server as HttpServer} from "http";
import chatService from "./chatService";
import securityUtil from "../utils/securityUtil";
import {config} from "dotenv";
import {llmTools} from "../utils/llmTools";
import {checkAvailabilityTool, createBookingTool} from "./llmToolHandlers";

config();

// In-memory fallback chat history (can be replaced with Redis later)
const chatSessions: Record<
	string,
	Array<{role: "user" | "assistant"; content: string}>
> = {};
const messageTimestamps: Record<string, number[]> = {}; // socket.id => [timestamps]

function isRateLimited(
	socketId: string,
	limit: number,
	windowMs: number
): boolean {
	const now = Date.now();
	const timestamps = messageTimestamps[socketId] || [];
	const recent = timestamps.filter((ts) => now - ts < windowMs);
	recent.push(now);
	messageTimestamps[socketId] = recent;
	return recent.length > limit;
}

function containsAbuse(message: string): boolean {
	const blockedWords = [
		"bhenchod",
		"madarchod",
		"mc",
		"bc",
		"chutiya",
		"chut",
		"lund",
		"gaand",
		"fuck",
		"shit",
		"sex",
		"porn",
		"politics",
		"religion",
	];
	const lower = message.toLowerCase();
	return blockedWords.some((word) => lower.includes(word));
}

// Helper to extract first JSON object from a string
function extractFirstJson(str: string): string | null {
	const match = str.match(/\{[\s\S]*\}/);
	return match ? match[0] : null;
}

export default class SocketService {
	private io!: Server;
	private chatService: chatService;

	constructor() {
		this.chatService = new chatService();
	}

	public initialize(server: HttpServer): void {
		this.io = new Server(server, {
			cors: {
				origin: [
					process.env.CLIENT_FRONTEND_URL || "https://sainievents.in",
					process.env.ADMIN_FRONTEND_URL || "https://admin.sainievents.in",
					"http://localhost:3000",
					"http://localhost:8080",
				],
				methods: ["GET", "POST"],
				credentials: true,
			},
		});

		this.io.on("connection", (socket: Socket) => {
			console.log("Client connected:", socket.id);

			const sessionId = securityUtil.generateUUID();
			socket.data.sessionId = sessionId;
			chatSessions[sessionId] = [];

			socket.on("chat:message", async (message: string) => {
				if (isRateLimited(socket.id, 5, 60_000)) {
					socket.emit("chat:response", {
						content: "⚠️ Please wait a moment before sending more messages.",
						timestamp: new Date().toISOString(),
						isComplete: true,
					});
					return;
				}

				if (containsAbuse(message)) {
					socket.emit("chat:response", {
						content:
							"⚠️ Kripya shisht bhasha ka prayog karein. Yeh chatbot sirf decoration se jude sawalon ke liye hai.",
						timestamp: new Date().toISOString(),
						isComplete: true,
					});
					return;
				}

				try {
					const chatHistory = chatSessions[sessionId] || [];
					chatHistory.push({role: "user", content: message});
					chatSessions[sessionId] = chatHistory;
					console.log("message", message);
					console.log("chatHistory", chatHistory);

					const response = await this.chatService.generateResponse(
						message,
						chatHistory
					);
					console.log("response", response);
					const aiReply = response.responseBody.data;

					let parsedAction = null;
					const jsonStr = extractFirstJson(aiReply);
					if (jsonStr) {
						try {
							parsedAction = JSON.parse(jsonStr);
						} catch (e) {
							parsedAction = null;
						}
					}

					// Helper to check required parameters
					function hasRequiredParams(obj: any, keys: string[]): string[] {
						if (!obj) return keys;
						return keys.filter((k) => !obj[k]);
					}

					if (parsedAction && parsedAction.action) {
						const {action, parameters, message: replyMessage} = parsedAction;

						if (action === "checkAvailability") {
							const missing = hasRequiredParams(parameters, [
								"serviceType",
								"date",
							]);
							if (missing.length) {
								socket.emit("chat:response", {
									content: `❗ Missing information: ${missing.join(", ")}. Please provide these details to check availability.`,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
							try {
								const result = await checkAvailabilityTool(parameters);
								// Prefer tool result message, fallback to LLM message, then default
								const finalMessage =
									result?.message ||
									replyMessage ||
									"✅ Availability checked. We'll update you shortly.";
								socket.emit("chat:response", {
									content: finalMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({role: "assistant", content: finalMessage});
								chatSessions[sessionId] = chatHistory;
								return;
							} catch (err) {
								socket.emit("chat:response", {
									content: `❗ Sorry, there was an error checking availability. Please try again later.`,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
						}

						if (action === "createBooking") {
							const missing = hasRequiredParams(parameters, [
								"serviceType",
								"date",
								"name",
								"phoneNumber",
								"location",
							]);
							if (missing.length) {
								socket.emit("chat:response", {
									content: `❗ Missing information: ${missing.join(", ")}. Please provide these details to make a booking.`,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
							try {
								const result = await createBookingTool(parameters);
								// Prefer tool result message, fallback to LLM message, then default
								const finalMessage =
									result?.message || replyMessage || "Booking request created.";
								socket.emit("chat:response", {
									content: finalMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({role: "assistant", content: finalMessage});
								chatSessions[sessionId] = chatHistory;
								return;
							} catch (err) {
								socket.emit("chat:response", {
									content: `❗ Sorry, there was an error creating the booking. Please try again later.`,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
						}
					}

					// If not structured, fallback to normal reply
					chatHistory.push({role: "assistant", content: aiReply});
					chatSessions[sessionId] = chatHistory;

					let currentText = "";
					for (const char of aiReply) {
						currentText += char;
						socket.emit("chat:stream", {
							content: currentText,
							timestamp: new Date().toISOString(),
							isComplete: false,
						});
						await new Promise((resolve) => setTimeout(resolve, 50));
					}

					socket.emit("chat:response", {
						content: aiReply,
						timestamp: new Date().toISOString(),
						isComplete: true,
					});
				} catch (error) {
					socket.emit("chat:error", {
						error: "Failed to generate response",
						timestamp: new Date().toISOString(),
					});
				}
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected:", socket.id);
				delete chatSessions[sessionId];
				delete messageTimestamps[socket.id];
			});
		});
	}
}
