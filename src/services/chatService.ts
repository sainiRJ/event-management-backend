import axios from 'axios';
import { iGenericServiceResult } from "../customTypes/commonServiceTypes";
import serviceUtil from "../utils/serviceUtil";
import { httpStatusCodes } from "../customTypes/networkTypes";
import { config } from 'dotenv';

config(); // load env

export default class ChatService {
  private geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private openaiEndpoint = 'https://api.openai.com/v1/chat/completions';

  private chatProvider = process.env.CHAT_PROVIDER || 'gemini';

  public async generateResponse(message: string): Promise<iGenericServiceResult<any>> {
    console.log("process.env.CHAT_PROVIDER ", process.env.CHAT_PROVIDER )
    console.log("Using GEMINI KEY:", process.env.GEMINI_API_KEY?.slice(0, 10));
    const BUSINESS_CONTEXT = `
    You are an intelligent and friendly assistant for **Saini Event Planner**, a trusted event decoration service based in Uttar Pradesh.
    
    **Service Areas:**
    We currently provide services in:
    - Pratapgarh
    - Amethi
    - Raebareli
    
    **Available Services & Starting Prices:**
    - 🚗 *Car Decoration* — starting from ₹3000
    - 🌼 *Haldi Decoration* — starting from ₹4000
    - 🎉 *Stage Decoration* — starting from ₹10,000
    - 🛕 *Mandap Setup* — starting from ₹5000
    
    ✅ Important Instructions:
    - Always respond in the same language the user speaks in — Hindi or English.
    - Do not invent any services, prices, or locations.
    - If the user asks about availability, tell them to visit the "Check Availability" page on our website or use the contact details on the "Contact" page (phone/WhatsApp) to get in touch with our team.
    - Be polite, warm, and professional in every reply.
    `;    

    try {
      if (this.chatProvider === 'openai') {
        const response = await axios.post(
          this.openaiEndpoint,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: BUSINESS_CONTEXT },
              { role: 'user', content: message }
            ]
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
      } else {
        console.log("gemini block")
        const response = await axios.post(
          `${this.geminiEndpoint}?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: `${BUSINESS_CONTEXT}\n\nUser: ${message}` }]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        console.log("gemini block response",response);


        return serviceUtil.buildResult(
          true,
          httpStatusCodes.SUCCESS_OK,
          null,
          response.data.candidates[0].content.parts[0].text
        );
      }
    } catch (error: any) {
      console.error("Gemini API error:", error?.response?.data || error.message);
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }
}