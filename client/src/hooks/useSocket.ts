import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, Participant, PollState } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

type Role = 'teacher' | 'student';

type UseSocketParams = {
  role: Role;
  name?: string;
  studentId?: string;
  enabled?: boolean;
};

type AckResponse = { ok: boolean; message?: string };

export const useSocket = ({ role, name, studentId, enabled = true }: UseSocketParams) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [pollState, setPollState] = useState<PollState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('session:join', { role, name, studentId }, (response: AckResponse) => {
        if (response && !response.ok) {
          setError(response.message || 'Unable to join session.');
        }
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setError('Unable to connect to the server.');
    });

    socket.on('poll:state', (state: PollState) => {
      setPollState(state);
    });

    socket.on('participants:update', (payload: { participants: Participant[] }) => {
      setParticipants(payload.participants || []);
    });

    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history || []);
    });

    socket.on('chat:new', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('student:kicked', () => {
      setKicked(true);
    });

    socket.on('app:error', (payload: { message?: string }) => {
      setError(payload?.message || 'Something went wrong.');
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, role, name, studentId]);

  const clearError = () => setError(null);

  const createPoll = (payload: { question: string; options: { text: string; isCorrect?: boolean }[]; durationSeconds: number }) => {
    return new Promise<AckResponse>((resolve) => {
      if (!socketRef.current) {
        const response = { ok: false, message: 'Socket not connected.' };
        setError(response.message);
        resolve(response);
        return;
      }

      socketRef.current.emit('poll:create', payload, (response: AckResponse) => {
        if (response && !response.ok) {
          setError(response.message || 'Unable to create poll.');
        }
        resolve(response);
      });
    });
  };

  const submitVote = (payload: { pollId: string; optionId: string }) => {
    return new Promise<AckResponse>((resolve) => {
      if (!socketRef.current) {
        const response = { ok: false, message: 'Socket not connected.' };
        setError(response.message);
        resolve(response);
        return;
      }

      socketRef.current.emit('poll:vote', payload, (response: AckResponse) => {
        if (response && !response.ok) {
          setError(response.message || 'Unable to submit vote.');
        }
        resolve(response);
      });
    });
  };

  const sendMessage = (message: string) => {
    return new Promise<AckResponse>((resolve) => {
      if (!socketRef.current) {
        const response = { ok: false, message: 'Socket not connected.' };
        setError(response.message);
        resolve(response);
        return;
      }

      socketRef.current.emit('chat:send', { message }, (response: AckResponse) => {
        if (response && !response.ok) {
          setError(response.message || 'Unable to send message.');
        }
        resolve(response);
      });
    });
  };

  const kickStudent = (studentId: string) => {
    return new Promise<AckResponse>((resolve) => {
      if (!socketRef.current) {
        const response = { ok: false, message: 'Socket not connected.' };
        setError(response.message);
        resolve(response);
        return;
      }

      socketRef.current.emit('student:kick', { studentId }, (response: AckResponse) => {
        if (response && !response.ok) {
          setError(response.message || 'Unable to remove student.');
        }
        resolve(response);
      });
    });
  };

  const requestState = () => {
    socketRef.current?.emit('poll:requestState');
  };

  return {
    connected,
    pollState,
    participants,
    messages,
    error,
    kicked,
    clearError,
    createPoll,
    submitVote,
    sendMessage,
    kickStudent,
    requestState,
  };
};
