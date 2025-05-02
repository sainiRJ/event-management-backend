import axios from 'axios';
import { iGenericServiceResult } from "../customTypes/commonServiceTypes";
import serviceUtil from "../utils/serviceUtil";
import { httpStatusCodes } from "../customTypes/networkTypes";
import { config } from 'dotenv';

config(); // Load .env

const BUSINESS_CONTEXT = `
You are an intelligent and friendly assistant for **Saini Event Planner**, a trusted event decoration service based in Uttar Pradesh.

📍 Service Areas:
- Pratapgarh, Amethi, Raebareli

🎉 Services & Prices:
- Car Decoration: ₹3000
- Haldi Decoration: ₹4000
- Stage Decoration: ₹10,000
- Mandap Setup: ₹5000

📋 Important Rules:
- ✅ Respond only to decoration-related queries
- ❌ Never confirm bookings
- ❌ Never ask for address, phone, event date, or payment method
- ✅ Instead, say:
   - “You can click the **Book Now** button to request a booking.”
   - “To check availability, please visit the **Check Availability** page.”
   - “To speak with our team, go to the **Contact** page for WhatsApp or phone.”
- 📵 You cannot send or receive images or personal data
- Always match the user's language (Hindi or English)
- Be polite, warm, and professional
`;

export default class ChatService {
  private geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
  private groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

  private chatProvider = process.env.CHAT_PROVIDER || 'gemini';

  public async generateResponse(
    currentMessage: string,
    chatHistory: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<iGenericServiceResult<any>> {

    const messages = [
      { role: 'system', content: BUSINESS_CONTEXT },
      ...chatHistory,
      { role: 'user', content: currentMessage }
    ];

    try {
      if (this.chatProvider === 'openai') {
        const response = await axios.post(
          this.openaiEndpoint,
          {
            model: 'gpt-3.5-turbo',
            messages
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );

        return serviceUtil.buildResult(
          true,
          httpStatusCodes.SUCCESS_OK,
          null,
          response.data.choices[0].message.content
        );
      }

      else if (this.chatProvider === 'groq') {
        const response = await axios.post(
          this.groqEndpoint,
          {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );

        return serviceUtil.buildResult(
          true,
          httpStatusCodes.SUCCESS_OK,
          null,
          response.data.choices[0].message.content
        );
      }

      else {
        const historyText = chatHistory
          .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n');

        const prompt = `${BUSINESS_CONTEXT}\n\n${historyText}\nUser: ${currentMessage}`;

        const response = await axios.post(
          `${this.geminiEndpoint}?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
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
