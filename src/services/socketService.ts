import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import chatService from './chatService';

export default class SocketService {
  private io!: Server;
  private chatService: chatService;

  constructor() {
    this.chatService = new chatService();
  }

  public initialize(server: HttpServer): void {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "http://23.94.233.79:3000", "http://192.169.0.141:3000", "http://localhost:8080"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('chat:message', async (message: string) => {
        try {
          console.log("messages", message);
          const response = await this.chatService.generateResponse(message);
          console.log("response", response);
          socket.emit('chat:response', {
            content: response.responseBody.data,
            timestamp: new Date().toISOString(),
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
      });
    });
  }
} 