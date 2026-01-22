export type Participant = {
  socketId: string;
  role: 'teacher' | 'student';
  name?: string;
  studentId?: string;
};

export class ParticipantService {
  private participants = new Map<string, Participant>();
  private studentSockets = new Map<string, string>();
  private kickedStudents = new Set<string>();

  addParticipant(socketId: string, payload: { role: 'teacher' | 'student'; name?: string; studentId?: string }) {
    const participant: Participant = {
      socketId,
      role: payload.role,
      name: payload.name,
      studentId: payload.studentId,
    };

    if (payload.role === 'student' && payload.studentId) {
      const existingSocketId = this.studentSockets.get(payload.studentId);
      if (existingSocketId && existingSocketId !== socketId) {
        this.participants.delete(existingSocketId);
      }
      this.studentSockets.set(payload.studentId, socketId);
    }

    this.participants.set(socketId, participant);
  }

  removeParticipant(socketId: string) {
    const participant = this.participants.get(socketId);
    if (participant?.studentId) {
      const currentSocket = this.studentSockets.get(participant.studentId);
      if (currentSocket === socketId) {
        this.studentSockets.delete(participant.studentId);
      }
    }
    this.participants.delete(socketId);
  }

  getParticipant(socketId: string) {
    return this.participants.get(socketId);
  }

  getStudents() {
    return Array.from(this.participants.values())
      .filter((participant) => participant.role === 'student')
      .map((participant) => ({
        studentId: participant.studentId || '',
        name: participant.name || 'Student',
      }));
  }

  getAllParticipants() {
    return Array.from(this.participants.values());
  }

  kickStudent(studentId: string) {
    const socketId = this.studentSockets.get(studentId);
    if (socketId) {
      this.kickedStudents.add(studentId);
      this.removeParticipant(socketId);
      return socketId;
    }
    return null;
  }

  isKicked(studentId: string) {
    return this.kickedStudents.has(studentId);
  }
}
