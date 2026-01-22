import { Server, Socket } from 'socket.io';
import { PollDoc } from '../models/Poll';
import { PollService } from '../services/PollService';
import { ParticipantService } from '../services/ParticipantService';
import { AppError } from '../utils/errors';

export type PollState = {
  poll: {
    id: string;
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    durationSeconds: number;
    startTime: number;
    endTime: number;
    status: 'active' | 'closed';
  } | null;
  results: { counts: Record<string, number>; total: number } | null;
  serverTime: number;
  canAskNewQuestion: boolean;
};

export class PollController {
  private endTimer: NodeJS.Timeout | null = null;
  private scheduledPollId: string | null = null;

  constructor(
    private io: Server,
    private pollService: PollService,
    private participantService: ParticipantService
  ) {}

  async bootstrap() {
    const poll = await this.pollService.getActivePoll();
    if (poll) {
      this.schedulePollEnd(poll);
    }
  }

  async getState(): Promise<PollState> {
    const poll = await this.pollService.getCurrentPoll();
    const serverTime = Date.now();

    if (!poll) {
      return {
        poll: null,
        results: null,
        serverTime,
        canAskNewQuestion: true,
      };
    }

    const results = await this.pollService.getResults(poll._id.toString());
    const canAskNewQuestion = poll.status === 'closed';

    if (poll.status === 'active') {
      this.schedulePollEnd(poll);
    }

    return {
      poll: this.serializePoll(poll),
      results,
      serverTime,
      canAskNewQuestion,
    };
  }

  async broadcastState() {
    const state = await this.getState();
    this.io.emit('poll:state', state);
  }

  async createPoll(payload: { question: string; options: { text: string; isCorrect?: boolean }[]; durationSeconds: number }) {
    const poll = await this.pollService.createPoll(payload);
    this.schedulePollEnd(poll);
    await this.broadcastState();
    return poll;
  }

  async submitVote(socket: Socket, payload: { pollId: string; optionId: string }) {
    const participant = this.participantService.getParticipant(socket.id);
    if (!participant || participant.role !== 'student' || !participant.studentId) {
      throw new AppError('Student session not found.', 403);
    }

    await this.pollService.recordVote({
      pollId: payload.pollId,
      optionId: payload.optionId,
      studentId: participant.studentId,
      studentName: participant.name || 'Student',
    });

    await this.maybeCloseIfAllAnswered(payload.pollId);
    await this.broadcastState();
  }

  async getHistory() {
    return this.pollService.getHistory();
  }

  private serializePoll(poll: PollDoc) {
    return {
      id: poll._id.toString(),
      question: poll.question,
      options: poll.options.map((option) => ({
        id: option._id.toString(),
        text: option.text,
        isCorrect: option.isCorrect,
      })),
      durationSeconds: poll.durationSeconds,
      startTime: poll.startTime.getTime(),
      endTime: poll.endTime.getTime(),
      status: poll.status,
    };
  }

  private schedulePollEnd(poll: PollDoc) {
    const pollId = poll._id.toString();
    if (poll.status !== 'active') {
      return;
    }

    if (this.scheduledPollId === pollId) {
      return;
    }

    if (this.endTimer) {
      clearTimeout(this.endTimer);
    }

    const remaining = poll.endTime.getTime() - Date.now();
    if (remaining <= 0) {
      return;
    }

    this.scheduledPollId = pollId;
    this.endTimer = setTimeout(async () => {
      await this.pollService.closePoll(pollId);
      this.scheduledPollId = null;
      await this.broadcastState();
    }, remaining);
  }

  private async maybeCloseIfAllAnswered(pollId: string) {
    const students = this.participantService.getStudents();
    if (students.length === 0) {
      return;
    }

    const totalVotes = await this.pollService.countVotes(pollId);
    if (totalVotes >= students.length) {
      await this.pollService.closePoll(pollId);
    }
  }
}
