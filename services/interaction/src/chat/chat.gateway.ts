import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Inject, forwardRef } from '@nestjs/common'
import { ChatService } from './chat.service'

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query['userId'] as string
    const sessionId = client.handshake.query['sessionId'] as string

    if (!userId || !sessionId) {
      client.disconnect()
      return
    }

    client.join(`session:${sessionId}`)
    client.data.userId = userId
    client.data.sessionId = sessionId

    await this.chatService.handleUserConnected(sessionId, userId)
    client.emit('session_joined', { sessionId })
  }

  async handleDisconnect(client: Socket) {
    const { userId, sessionId } = client.data
    if (userId && sessionId) {
      await this.chatService.handleUserDisconnected(sessionId, userId)
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      sessionId: string
      content?: string
      type?: string
      fileUrl?: string
      fileName?: string
      fileSize?: number
    },
  ) {
    const message = await this.chatService.saveMessage({
      sessionId: data.sessionId,
      senderId: client.data.userId,
      content: data.content,
      type: data.type as any ?? 'text',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    })

    this.server.to(`session:${data.sessionId}`).emit('new_message', message)
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; messageId: string },
  ) {
    await this.chatService.markMessageRead(data.messageId)
    client.emit('marked_read', { messageId: data.messageId })
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.to(`session:${data.sessionId}`).emit('typing', {
      senderId: client.data.userId,
    })
  }

  emitToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session:${sessionId}`).emit(event, data)
  }

  emitTick(sessionId: string, timeRemaining: number) {
    this.server.to(`session:${sessionId}`).emit('tick', { timeRemaining })
  }
}