import { Server, Socket } from 'socket.io';
import { ParticipantService } from '../services/ParticipantService';
import { AppError } from '../utils/errors';

export class SessionController {
  constructor(private io: Server, private participantService: ParticipantService) {}

  join(socket: Socket, payload: { role: 'teacher' | 'student'; name?: string; studentId?: string }) {
    if (!payload?.role) {
      throw new AppError('Role is required.');
    }

    if (payload.role === 'student') {
      if (!payload.studentId) {
        throw new AppError('Student ID is required.');
      }

      if (this.participantService.isKicked(payload.studentId)) {
        socket.emit('student:kicked');
        socket.disconnect();
        return;
      }
    }

    this.participantService.addParticipant(socket.id, payload);
    this.broadcastParticipants();
  }

  disconnect(socket: Socket) {
    this.participantService.removeParticipant(socket.id);
    this.broadcastParticipants();
  }

  broadcastParticipants() {
    const participants = this.participantService.getStudents();
    this.io.emit('participants:update', { participants });
  }

  kickStudent(studentId: string) {
    if (!studentId) {
      throw new AppError('Student ID is required.');
    }

    const socketId = this.participantService.kickStudent(studentId);
    if (!socketId) {
      throw new AppError('Student not found.');
    }

    this.io.to(socketId).emit('student:kicked');
    const socket = this.io.sockets.sockets.get(socketId);
    socket?.disconnect(true);
    this.broadcastParticipants();
  }
}
