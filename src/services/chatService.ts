import axios from "axios";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import serviceUtil from "../utils/serviceUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {config} from "dotenv";

config(); // Load .env

const BUSINESS_CONTEXT = `
You are an intelligent and friendly assistant for **Saini Event Planner**, a trusted event decoration service based in Uttar Pradesh.

📍 Service Areas:
- Pratapgarh, Amethi, Raebareli districts

🎉 Services & Starting Prices:
- Car Decoration: starting from ₹3000
- Haldi Decoration: starting from ₹4000
- Stage Decoration: starting from ₹10,000
- Mandap Setup: starting from ₹5000

📋 Tool Call Rules:
- ✅ When users ask to check availability or make a booking, always respond using this structured JSON format:
{
  "action": "checkAvailability" | "createBooking" | "none",
  "parameters": {
    "serviceType": string,
    "date": string,
    "name"?: string,
    "phoneNumber"?: string,
    "email"?: string,
    "location"?: string,
    "notes"?: string
  },
  "message": "Short friendly confirmation message"
}

🔒 IMPORTANT:
- ✅ Only generate "action": "createBooking" if the user **explicitly says** things like:
  - "I want to book", "please book", "confirm booking", "make a booking", "book this", etc.
- ❌ If the user only says "yes", "okay", "hmm", etc., DO NOT assume booking.
  - Instead, reply with: "Do you want me to proceed with the booking?"

🧠 Behavior & Tone:
- Understand and respond in Hindi, English, or Hinglish.
- Be polite, professional, and human-like.
- Do not explain the JSON output or say "Here's the action JSON."
- Only respond with human-friendly confirmation text for the user interface.

🚨 VERY IMPORTANT:
- Respond with ONLY the JSON object as specified above, and nothing else. Do NOT include any explanation, extra text, or commentary before or after the JSON. Strictly output the JSON object only.
`;

export default class ChatService {
	private geminiEndpoint =
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
	private openaiEndpoint = "https://api.openai.com/v1/chat/completions";
	private groqEndpoint = "https://api.groq.com/openai/v1/chat/completions";

	private chatProvider = process.env.CHAT_PROVIDER || "gemini";

	public async generateResponse(
		currentMessage: string,
		chatHistory: Array<{role: "user" | "assistant"; content: string}>
	): Promise<iGenericServiceResult<any>> {
		const messages = [
			{role: "system", content: BUSINESS_CONTEXT},
			...chatHistory,
			{role: "user", content: currentMessage},
		];

		try {
			if (this.chatProvider === "openai") {
				const response = await axios.post(
					this.openaiEndpoint,
					{
						model: "gpt-3.5-turbo",
						messages,
					},
					{
						headers: {
							Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
							"Content-Type": "application/json",
						},
					}
				);

				return serviceUtil.buildResult(
					true,
					httpStatusCodes.SUCCESS_OK,
					null,
					response.data.choices[0].message.content
				);
			} else if (this.chatProvider === "groq") {
				const response = await axios.post(
					this.groqEndpoint,
					{
						model: "meta-llama/llama-4-scout-17b-16e-instruct",
						messages,
					},
					{
						headers: {
							Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
							"Content-Type": "application/json",
						},
					}
				);

				return serviceUtil.buildResult(
					true,
					httpStatusCodes.SUCCESS_OK,
					null,
					response.data.choices[0].message.content
				);
			} else {
				const historyText = chatHistory
					.map(
						(m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
					)
					.join("\n");

				const prompt = `${BUSINESS_CONTEXT}

					🎯 Whenever user asks to check availability or make a booking, always respond in the following JSON format:

					{
					"action": "checkAvailability" | "createBooking" | "none",
					"parameters": {
						"serviceType": string,
						"date": string,
						"name"?: string,
						"phoneNumber"?: string,
						"email"?: string,
						"location"?: string,
						"notes"?: string
					},
					"message": "Optional message to confirm action"
					}

					If not sure, respond with { "action": "none", "message": "..." }

					History:
					${historyText}

					User: ${currentMessage}
				`;

				const response = await axios.post(
					`${this.geminiEndpoint}?key=${process.env.GEMINI_API_KEY}`,
					{
						contents: [
							{
								role: "user",
								parts: [{text: prompt}],
							},
						],
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				return serviceUtil.buildResult(
					true,
					httpStatusCodes.SUCCESS_OK,
					null,
					response.data.candidates[0].content.parts[0].text
				);
			}
		} catch (error: any) {
			console.error("Chat API error:", error?.response?.data || error.message);
			throw new Error(`Failed to generate chat response: ${error.message}`);
		}
	}
}
