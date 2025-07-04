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

🎉 Available Services & Starting Prices:
- Car Decoration (or "car"): starting from ₹3000
- Haldi Decoration (or "haldi"): starting from ₹4000
- Stage Decoration (or "stage"): starting from ₹10,000
- Mandap Setup (or "mandap"): starting from ₹5000

📝 Service Name Variations:
- Users can say: "car", "car decoration", "haldi", "haldi decoration", "stage", "stage decoration", "mandap", "mandap setup"
- All variations are valid and will be understood correctly

📋 Tool Call Rules:
- ✅ When users ask to check availability, respond with:
{
  "action": "checkAvailability",
  "parameters": {
    "serviceType": string,
    "date": string
  },
  "message": "Short friendly confirmation message"
}

- ✅ When users ask to make a booking, respond with:
{
  "action": "createBooking",
  "parameters": {
    "serviceType": string,
    "date": string,
    "name": string,
    "phoneNumber": string,
    "email"?: string,
    "location": string,
    "notes"?: string
  },
  "message": "Short friendly confirmation message"
}

- ✅ When users ask to see photos or examples, respond with:
{
  "action": "showPhotos",
  "parameters": {
    "serviceType": string
  },
  "message": "Short friendly confirmation message"
}

- ✅ For general questions, respond with:
{
  "action": "none",
  "message": "Your response here"
}

🔒 STRICT TOPIC RESTRICTIONS:
- ✅ ONLY respond to queries related to:
  - Event decoration services (car, haldi, stage, mandap)
  - Booking inquiries and availability checks
  - Pricing information for decoration services
  - Service area questions (Pratapgarh, Amethi, Raebareli)
  - General event planning questions related to decoration

- ❌ DO NOT respond to queries about:
  - Politics, elections, or government
  - Geopolitics, international relations, or current affairs
  - Religion or religious discussions
  - Sports, entertainment, or unrelated topics
  - Technical questions unrelated to decoration
  - Personal advice or counseling

- 🚫 If user asks about off-topic subjects, respond with:
  { "action": "none", "message": "Maaf kijiye, main sirf event decoration aur booking se jude sawalon ka jawab de sakta hun. Kya aap decoration services ke bare mein kuch puchna chahte hain?" }

🔒 IMPORTANT RULES:
- ✅ For "checkAvailability": Only ask for serviceType and date. DO NOT ask for location, name, or phone number.
- ✅ For "createBooking": Ask for serviceType, date, name, phoneNumber, and location. Email and notes are optional.
- ✅ Only generate "action": "createBooking" if the user **explicitly says** things like:
  - "I want to book", "please book", "confirm booking", "make a booking", "book this", etc.
- ❌ If the user only says "yes", "okay", "hmm", etc., DO NOT assume booking.
  - Instead, reply with: "Do you want me to proceed with the booking?"
- 🚫 DO NOT ask for location when checking availability - location is only needed for booking.

🧠 Behavior & Tone:
- Users can chat with you in Hindi, English, or Hinglish - understand and respond accordingly.
- Be polite, professional, and human-like.
- Do not explain the JSON output or say "Here's the action JSON."
- Only respond with human-friendly confirmation text for the user interface.

🎯 Greeting Responses:
- For simple greetings like "hi", "hello", "namaste", respond with:
  { "action": "none", "message": "Hi! I'm here to help you with event decoration services. What can I assist you with today?" }
- Keep greeting responses short, friendly, and in the same language as the user's greeting.
- Don't overwhelm users with too much information in the first response.

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

					🎯 IMPORTANT: If the user asks about politics, geopolitics, religion, sports, or any topic unrelated to event decoration, immediately respond with:
					{ "action": "none", "message": "Maaf kijiye, main sirf event decoration aur booking se jude sawalon ka jawab de sakta hun. Kya aap decoration services ke bare mein kuch puchna chahte hain?" }

					🎯 For simple greetings (hi, hello, namaste), respond with:
					{ "action": "none", "message": "Hi! I'm here to help you with event decoration services. What can I assist you with today?" }

					🎯 For availability checks, respond with:
					{
					"action": "checkAvailability",
					"parameters": {
						"serviceType": string,
						"date": string
					},
					"message": "Short friendly confirmation message"
					}

					🎯 For booking requests, respond with:
					{
					"action": "createBooking",
					"parameters": {
						"serviceType": string,
						"date": string,
						"name": string,
						"phoneNumber": string,
						"email"?: string,
						"location": string,
						"notes"?: string
					},
					"message": "Short friendly confirmation message"
					}

					🎯 For photo requests (show me photos, examples, etc.), respond with:
					{
					"action": "showPhotos",
					"parameters": {
						"serviceType": string
					},
					"message": "Short friendly confirmation message"
					}

					🎯 For general questions, respond with:
					{ "action": "none", "message": "Your response here" }

					🚫 CRITICAL: For availability checks, ONLY ask for serviceType and date. DO NOT ask for location, name, or phone number.

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
