import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/messages' })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  sendMessageToUser(userId: string, message: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('message', message);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { recipientId: string }) {
    const socketId = this.userSockets.get(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit('typing', { userId: client.handshake.query.userId });
    }
  }
}
