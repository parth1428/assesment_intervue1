import http from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { PollService } from '../services/PollService';
import { ParticipantService } from '../services/ParticipantService';
import { ChatService } from '../services/ChatService';
import { PollController } from '../controllers/PollController';
import { ChatController } from '../controllers/ChatController';
import { SessionController } from '../controllers/SessionController';
import { getErrorMessage } from '../utils/errors';

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  const pollService = new PollService();
  const participantService = new ParticipantService();
  const chatService = new ChatService();

  const pollController = new PollController(io, pollService, participantService);
  const chatController = new ChatController(io, chatService, participantService);
  const sessionController = new SessionController(io, participantService);

  pollController.bootstrap().catch((error) => {
    console.error('Poll bootstrap failed:', error);
  });

  io.on('connection', (socket) => {
    socket.on('session:join', async (payload, ack) => {
      try {
        sessionController.join(socket, payload);
        const state = await pollController.getState();
        socket.emit('poll:state', state);
        chatController.sendHistory(socket);
        ack?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error, 'Unable to join session.');
        socket.emit('app:error', { message });
        ack?.({ ok: false, message });
      }
    });

    socket.on('poll:create', async (payload, ack) => {
      try {
        await pollController.createPoll(payload);
        ack?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error, 'Unable to create poll.');
        socket.emit('app:error', { message });
        ack?.({ ok: false, message });
      }
    });

    socket.on('poll:vote', async (payload, ack) => {
      try {
        await pollController.submitVote(socket, payload);
        ack?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error, 'Unable to submit vote.');
        socket.emit('app:error', { message });
        ack?.({ ok: false, message });
      }
    });

    socket.on('student:kick', async (payload, ack) => {
      try {
        const participant = participantService.getParticipant(socket.id);
        if (participant?.role !== 'teacher') {
          throw new Error('Only teachers can remove students.');
        }

        sessionController.kickStudent(payload?.studentId);
        ack?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error, 'Unable to remove student.');
        socket.emit('app:error', { message });
        ack?.({ ok: false, message });
      }
    });

    socket.on('chat:send', async (payload, ack) => {
      try {
        chatController.handleMessage(socket, payload?.message || '');
        ack?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error, 'Unable to send message.');
        socket.emit('app:error', { message });
        ack?.({ ok: false, message });
      }
    });

    socket.on('poll:requestState', async () => {
      const state = await pollController.getState();
      socket.emit('poll:state', state);
    });

    socket.on('disconnect', () => {
      sessionController.disconnect(socket);
    });
  });

  return io;
};
