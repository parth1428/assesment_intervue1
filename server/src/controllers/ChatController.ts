import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/ChatService';
import { ParticipantService } from '../services/ParticipantService';
import { AppError } from '../utils/errors';

export class ChatController {
  constructor(
    private io: Server,
    private chatService: ChatService,
    private participantService: ParticipantService
  ) {}

  sendHistory(socket: Socket) {
    socket.emit('chat:history', this.chatService.getHistory());
  }

  handleMessage(socket: Socket, message: string) {
    const participant = this.participantService.getParticipant(socket.id);
    if (!participant) {
      throw new AppError('Session not found.', 403);
    }

    const trimmed = message.trim();
    if (!trimmed) {
      throw new AppError('Message cannot be empty.');
    }

    const chatMessage = this.chatService.addMessage({
      name: participant.name || (participant.role === 'teacher' ? 'Teacher' : 'Student'),
      role: participant.role,
      message: trimmed,
    });

    this.io.emit('chat:new', chatMessage);
  }
}
