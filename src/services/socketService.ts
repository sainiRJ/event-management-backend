// SocketService.ts
import {Server, Socket} from "socket.io";
import {Server as HttpServer} from "http";
import chatService from "./chatService";
import securityUtil from "../utils/securityUtil";
import {config} from "dotenv";
import {llmTools} from "../utils/llmTools";
import {checkAvailabilityTool, createBookingTool, showPhotosTool} from "./llmToolHandlers";

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
					const response = await this.chatService.generateResponse(
						message,
						chatHistory
					);
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
						console.log("parsedAction ", parsedAction)

						if (action === "checkAvailability") {
							const missing = hasRequiredParams(parameters, [
								"serviceType",
								"date",
							]);
							if (missing.length) {
								let fallbackMsg = '';
								if (missing.includes('serviceType')) {
									fallbackMsg = `😊 Could you tell me which service you'd like to book? 

🎉 Our available services:
• Car Decoration (starting from ₹3000)
• Haldi Decoration (starting from ₹4000) 
• Stage Decoration (starting from ₹10,000)
• Mandap Setup (starting from ₹5000)

Which service would you like to book?`;
								} else if (missing.includes('date')) {
									fallbackMsg = `📅 Could you tell me which date you need the service for? 

You can provide the date like this:
• "25 July"
• "1 June 2025" 
• "15 August"

Could you specify a date?`;
								} else {
									fallbackMsg = replyMessage || `😊 Could you provide these details: ${missing.join(", ")}?`;
								}

								// Stream the response
								let currentText = "";
								for (const char of fallbackMsg) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: fallbackMsg,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({ role: "assistant", content: fallbackMsg });
								chatSessions[sessionId] = chatHistory;
								return;
							}
							try {
								const result = await checkAvailabilityTool(parameters);
								console.log("result ", result)
								
								// Create a more conversational response
								let finalMessage = '';
								if (result?.available === true) {
									finalMessage = `🎉 Great! ${parameters.serviceType} is available on ${parameters.date}! 

💡 Would you like to book it? If yes, please provide me with:
• Your name
• Phone number  
• Location (Pratapgarh, Amethi, or Raebareli district)

I'll create the booking for you! 😊`;
								} else if (result?.available === false) {
									finalMessage = `😔 Sorry, ${parameters.serviceType} is already booked on ${parameters.date}. 

💡 Would you like to try a different date? Or would you like to book a different service?`;
								} else {
									finalMessage = result?.message || replyMessage || "✅ Availability checked. We'll update you shortly.";
								}

								// Stream the response for better UX
								let currentText = "";
								for (const char of finalMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: finalMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({role: "assistant", content: finalMessage});
								chatSessions[sessionId] = chatHistory;
								return;
							} catch (err) {
								const errorMessage = `😔 Sorry, there was a problem checking availability. Please try again in a moment.`;
								
								let currentText = "";
								for (const char of errorMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: errorMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
						}

						if (action === "showPhotos") {
							const missing = hasRequiredParams(parameters, ["serviceType"]);
							if (missing.length) {
								const missingMsg = `😊 Could you tell me which service photos you'd like to see? 

🎉 Our available services:
• Car Decoration
• Haldi Decoration 
• Stage Decoration
• Mandap Setup`;

								// Stream the response
								let currentText = "";
								for (const char of missingMsg) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: missingMsg,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
							try {
								const result = await showPhotosTool(parameters);
								
								// Create a more conversational response
								let finalMessage = '';
								if (result?.success === true && result?.photos && result.photos.length > 0) {
									finalMessage = `📸 Here are some beautiful ${parameters.serviceType} examples! 

${result.photos.map((photo, index) => `${index + 1}. ${photo.title || 'Decoration Photo'}`).join('\n')}

💡 You can click on any photo to view it in full size and download it.

📂 For more photos, please check our gallery page!`;
									
									// Send photos data separately
									socket.emit("chat:photos", {
										photos: result.photos,
										serviceType: parameters.serviceType,
										timestamp: new Date().toISOString(),
									});
								} else {
									finalMessage = result?.message || "No photos available for this service at the moment.";
								}

								// Stream the response
								let currentText = "";
								for (const char of finalMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: finalMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({role: "assistant", content: finalMessage});
								chatSessions[sessionId] = chatHistory;
								return;
							} catch (err) {
								const errorMessage = `😔 Sorry, there was a problem fetching photos. Please try again in a moment.`;
								
								let currentText = "";
								for (const char of errorMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: errorMessage,
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
								let missingMsg = '';
								if (missing.includes('name')) {
									missingMsg = `👤 Could you tell me your name?`;
								} else if (missing.includes('phoneNumber')) {
									missingMsg = `📞 Could you share your phone number? Our team will call you.`;
								} else if (missing.includes('location')) {
									missingMsg = `📍 Could you tell me where you're from? We provide services in Pratapgarh, Amethi, and Raebareli districts.`;
								} else if (missing.includes('serviceType')) {
									missingMsg = `😊 Could you tell me which service you'd like to book? 

🎉 Our available services:
• Car Decoration (starting from ₹3000)
• Haldi Decoration (starting from ₹4000) 
• Stage Decoration (starting from ₹10,000)
• Mandap Setup (starting from ₹5000)`;
								} else if (missing.includes('date')) {
									missingMsg = `📅 Could you tell me which date you need the service for?`;
								} else {
									missingMsg = `😊 Could you provide these details: ${missing.join(", ")}?`;
								}

								// Stream the response
								let currentText = "";
								for (const char of missingMsg) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: missingMsg,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
							try {
								const result = await createBookingTool(parameters);
								
								// Create a more conversational response
								let finalMessage = '';
								if (result?.isBooked === true) {
									finalMessage = `🎉 Wow! Booking request successfully created! 

📋 Your booking details:
• Service: ${parameters.serviceType}
• Date: ${parameters.date}
• Name: ${parameters.name}
• Location: ${parameters.location}

📞 Our team will call you soon (${parameters.phoneNumber}) to discuss final details.

💡 Need anything else? I'm here to help! 😊`;
								} else {
									finalMessage = result?.message || replyMessage || "Booking request created.";
								}

								// Stream the response for better UX
								let currentText = "";
								for (const char of finalMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: finalMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								chatHistory.push({role: "assistant", content: finalMessage});
								chatSessions[sessionId] = chatHistory;
								return;
							} catch (err) {
								const errorMessage = `😔 Sorry, there was a problem creating the booking. Please try again in a moment.`;
								
								let currentText = "";
								for (const char of errorMessage) {
									currentText += char;
									socket.emit("chat:stream", {
										content: currentText,
										timestamp: new Date().toISOString(),
										isComplete: false,
									});
									await new Promise((resolve) => setTimeout(resolve, 30));
								}

								socket.emit("chat:response", {
									content: errorMessage,
									timestamp: new Date().toISOString(),
									isComplete: true,
								});
								return;
							}
						}
					}

					// If not structured, fallback to normal reply
					let fallbackMessage = '';

					try {
					const parsed = JSON.parse(aiReply);
					fallbackMessage = parsed.message || JSON.stringify(parsed);
					} catch {
					fallbackMessage = aiReply;
					}
					chatHistory.push({role: "assistant", content: fallbackMessage});
					chatSessions[sessionId] = chatHistory;

					let currentText = "";
					for (const char of fallbackMessage) {
						currentText += char;
						socket.emit("chat:stream", {
							content: currentText,
							timestamp: new Date().toISOString(),
							isComplete: false,
						});
						await new Promise((resolve) => setTimeout(resolve, 50));
					}

					socket.emit("chat:response", {
						content: fallbackMessage,
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
