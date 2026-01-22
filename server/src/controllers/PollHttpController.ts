import { Request, Response } from 'express';
import { PollService } from '../services/PollService';
import { getErrorMessage } from '../utils/errors';

export class PollHttpController {
  constructor(private pollService: PollService) {}

  getHistory = async (_req: Request, res: Response) => {
    try {
      const history = await this.pollService.getHistory();
      res.json({ ok: true, history });
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to fetch poll history.');
      res.status(500).json({ ok: false, message });
    }
  };
}
