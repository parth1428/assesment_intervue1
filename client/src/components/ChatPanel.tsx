import { useMemo, useState } from 'react';
import type { ChatMessage, Participant } from '../types';

export const ChatPanel = ({
  role,
  isOpen,
  onClose,
  participants,
  messages,
  onSend,
  onKick,
}: {
  role: 'teacher' | 'student';
  isOpen: boolean;
  onClose?: () => void;
  participants: Participant[];
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onKick?: (studentId: string) => void;
}) => {
  const [tab, setTab] = useState<'chat' | 'participants'>('chat');
  const [text, setText] = useState('');

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  if (!isOpen) {
    return null;
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setText('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-tabs">
          <button
            type="button"
            className={tab === 'chat' ? 'is-active' : ''}
            onClick={() => setTab('chat')}
          >
            Chat
          </button>
          <button
            type="button"
            className={tab === 'participants' ? 'is-active' : ''}
            onClick={() => setTab('participants')}
          >
            Participants
          </button>
        </div>
        {onClose && (
          <button className="chat-close" onClick={onClose} type="button">
            Close
          </button>
        )}
      </div>

      {tab === 'chat' ? (
        <div className="chat-body">
          <div className="chat-messages">
            {sortedMessages.length === 0 ? (
              <div className="chat-empty">Start the conversation.</div>
            ) : (
              sortedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.role === role ? 'is-self' : ''}`}
                >
                  <div className="chat-name">{message.name}</div>
                  <div className="chat-bubble">{message.message}</div>
                </div>
              ))
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button type="button" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="participants-list">
          {participants.length === 0 ? (
            <div className="chat-empty">No students connected.</div>
          ) : (
            participants.map((participant) => (
              <div key={participant.studentId} className="participant-row">
                <span>{participant.name}</span>
                {role === 'teacher' && onKick && (
                  <button type="button" onClick={() => onKick(participant.studentId)}>
                    Kick out
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
