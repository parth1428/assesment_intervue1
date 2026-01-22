import mongoose from 'mongoose';
import { Poll, PollDoc } from '../models/Poll';
import { Vote } from '../models/Vote';
import { AppError } from '../utils/errors';

export type PollResults = {
  counts: Record<string, number>;
  total: number;
};

export type CreatePollPayload = {
  question: string;
  options: { text: string; isCorrect?: boolean }[];
  durationSeconds: number;
};

export class PollService {
  async getCurrentPoll(): Promise<PollDoc | null> {
    const poll = await Poll.findOne().sort({ createdAt: -1 });
    if (!poll) {
      return null;
    }

    await this.closeIfExpired(poll);
    return poll;
  }

  async getActivePoll(): Promise<PollDoc | null> {
    const poll = await Poll.findOne({ status: 'active' }).sort({ createdAt: -1 });
    if (!poll) {
      return null;
    }

    const expired = await this.closeIfExpired(poll);
    return expired ? null : poll;
  }

  async canCreatePoll(): Promise<{ allowed: boolean; reason?: string }> {
    const activePoll = await Poll.findOne({ status: 'active' }).sort({ createdAt: -1 });
    if (!activePoll) {
      return { allowed: true };
    }

    const expired = await this.closeIfExpired(activePoll);
    if (expired) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'A poll is already running.' };
  }

  async createPoll(payload: CreatePollPayload): Promise<PollDoc> {
    const canCreate = await this.canCreatePoll();
    if (!canCreate.allowed) {
      throw new AppError(canCreate.reason || 'Cannot create poll right now.');
    }

    if (!payload.question.trim()) {
      throw new AppError('Question is required.');
    }

    if (payload.options.length < 2) {
      throw new AppError('At least two options are required.');
    }

    if (payload.options.some((option) => !option.text.trim())) {
      throw new AppError('All options must have text.');
    }

    if (!Number.isFinite(payload.durationSeconds) || payload.durationSeconds < 5) {
      throw new AppError('Duration must be at least 5 seconds.');
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + payload.durationSeconds * 1000);

    return Poll.create({
      question: payload.question.trim(),
      options: payload.options.map((option) => ({
        text: option.text.trim(),
        isCorrect: Boolean(option.isCorrect),
      })),
      durationSeconds: payload.durationSeconds,
      startTime: now,
      endTime,
      status: 'active',
    });
  }

  async recordVote(params: {
    pollId: string;
    optionId: string;
    studentId: string;
    studentName: string;
  }): Promise<PollResults> {
    const poll = await Poll.findById(params.pollId);
    if (!poll) {
      throw new AppError('Poll not found.', 404);
    }

    const expired = await this.closeIfExpired(poll);
    if (expired || poll.status !== 'active') {
      throw new AppError('Poll has ended.');
    }

    const optionMatch = poll.options.some(
      (option) => option._id.toString() === params.optionId
    );
    if (!optionMatch) {
      throw new AppError('Invalid option selected.');
    }

    try {
      await Vote.create({
        pollId: poll._id,
        optionId: new mongoose.Types.ObjectId(params.optionId),
        studentId: params.studentId,
        studentName: params.studentName,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new AppError('You have already voted for this question.');
      }
      throw error;
    }

    return this.getResults(params.pollId);
  }

  async getResults(pollId: string): Promise<PollResults> {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      throw new AppError('Poll not found.', 404);
    }

    const counts: Record<string, number> = {};
    poll.options.forEach((option) => {
      counts[option._id.toString()] = 0;
    });

    const results = await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $group: { _id: '$optionId', total: { $sum: 1 } } },
    ]);

    let total = 0;
    results.forEach((result) => {
      const key = result._id.toString();
      counts[key] = result.total;
      total += result.total;
    });

    return { counts, total };
  }

  async getHistory(): Promise<Array<{ poll: PollDoc; results: PollResults }>> {
    const polls = await Poll.find({ status: 'closed' }).sort({ createdAt: -1 });
    const history = await Promise.all(
      polls.map(async (poll) => ({
        poll,
        results: await this.getResults(poll._id.toString()),
      }))
    );

    return history;
  }

  async closePoll(pollId: string): Promise<void> {
    await Poll.findByIdAndUpdate(pollId, { status: 'closed' });
  }

  async closeIfExpired(poll: PollDoc): Promise<boolean> {
    if (poll.status === 'active' && poll.endTime.getTime() <= Date.now()) {
      poll.status = 'closed';
      await poll.save();
      return true;
    }
    return false;
  }

  async countVotes(pollId: string): Promise<number> {
    return Vote.countDocuments({ pollId: new mongoose.Types.ObjectId(pollId) });
  }
}
