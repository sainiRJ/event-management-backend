// SocketService.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import chatService from './chatService';
import securityUtil from "../utils/securityUtil";

// In-memory fallback chat history (can be replaced with Redis later)
const chatSessions: Record<string, Array<{ role: 'user' | 'assistant', content: string }>> = {};
const messageTimestamps: Record<string, number[]> = {}; // socket.id => [timestamps]

function isRateLimited(socketId: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = messageTimestamps[socketId] || [];
  const recent = timestamps.filter(ts => now - ts < windowMs);
  recent.push(now);
  messageTimestamps[socketId] = recent;
  return recent.length > limit;
}

function containsAbuse(message: string): boolean {
  const blockedWords = [
    'bhenchod', 'madarchod', 'mc', 'bc', 'chutiya', 'chut',
    'lund', 'gaand', 'fuck', 'shit', 'sex', 'porn', 'politics', 'religion'
  ];
  const lower = message.toLowerCase();
  return blockedWords.some(word => lower.includes(word));
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
	    	origin: [process.env.CLIENT_FRONTEND_URL, process.env.ADMIN_FRONTEND_URL],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      const sessionId = securityUtil.generateUUID();
      socket.data.sessionId = sessionId;
      chatSessions[sessionId] = [];

      socket.on('chat:message', async (message: string) => {
        if (isRateLimited(socket.id, 5, 60_000)) {
          socket.emit('chat:response', {
            content: "⚠️ Please wait a moment before sending more messages.",
            timestamp: new Date().toISOString(),
            isComplete: true
          });
          return;
        }

        if (containsAbuse(message)) {
          socket.emit('chat:response', {
            content: "⚠️ Kripya shisht bhasha ka prayog karein. Yeh chatbot sirf decoration se jude sawalon ke liye hai.",
            timestamp: new Date().toISOString(),
            isComplete: true
          });
          return;
        }

        try {
          const chatHistory = chatSessions[sessionId] || [];
          chatHistory.push({ role: 'user', content: message });

          const response = await this.chatService.generateResponse(message, chatHistory);
          const aiReply = response.responseBody.data;

          chatHistory.push({ role: 'assistant', content: aiReply });
          chatSessions[sessionId] = chatHistory;

          let currentText = '';
          for (const char of aiReply) {
            currentText += char;
            socket.emit('chat:stream', {
              content: currentText,
              timestamp: new Date().toISOString(),
              isComplete: false
            });
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          socket.emit('chat:response', {
            content: aiReply,
            timestamp: new Date().toISOString(),
            isComplete: true
          });
        } catch (error) {
          socket.emit('chat:error', {
            error: 'Failed to generate response',
            timestamp: new Date().toISOString()
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        delete chatSessions[sessionId];
        delete messageTimestamps[socket.id];
      });
    });
  }
}
