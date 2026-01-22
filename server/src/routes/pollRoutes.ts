import { Router } from 'express';
import { PollService } from '../services/PollService';
import { PollHttpController } from '../controllers/PollHttpController';

const router = Router();
const pollService = new PollService();
const pollController = new PollHttpController(pollService);

router.get('/history', pollController.getHistory);

export const pollRouter = router;
