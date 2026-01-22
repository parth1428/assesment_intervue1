export type PollOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  durationSeconds: number;
  startTime: number;
  endTime: number;
  status: 'active' | 'closed';
};

export type PollResults = {
  counts: Record<string, number>;
  total: number;
};

export type PollState = {
  poll: Poll | null;
  results: PollResults | null;
  serverTime: number;
  canAskNewQuestion: boolean;
};

export type Participant = {
  studentId: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  message: string;
  timestamp: number;
};
