export type ChatMessage = {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  message: string;
  timestamp: number;
};

export class ChatService {
  private messages: ChatMessage[] = [];
  private maxMessages = 50;

  addMessage(payload: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
      ...payload,
    };

    this.messages.push(message);
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    return message;
  }

  getHistory() {
    return this.messages.slice();
  }
}
