import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../components/BrandBadge';
import { ChatPanel } from '../components/ChatPanel';
import { ResultsList } from '../components/ResultsList';
import { TimerBadge } from '../components/TimerBadge';
import { Toast } from '../components/Toast';
import { usePollTimer } from '../hooks/usePollTimer';
import { useSocket } from '../hooks/useSocket';
import { formatTime } from '../utils/time';

type DraftOption = { id: string; text: string; isCorrect: boolean };

const defaultOptions: DraftOption[] = [
  { id: '1', text: '', isCorrect: true },
  { id: '2', text: '', isCorrect: false },
];

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<DraftOption[]>(defaultOptions);
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  const {
    pollState,
    participants,
    messages,
    createPoll,
    sendMessage,
    kickStudent,
    error,
    clearError,
  } = useSocket({ role: 'teacher', name: 'Teacher' });

  const remainingSeconds = usePollTimer(pollState?.poll?.endTime, pollState?.serverTime);

  const canAskNew = pollState?.canAskNewQuestion ?? true;
  const activePoll = pollState?.poll;

  const showCreate = !activePoll || canAskNew;
  const statusMessage = canAskNew
    ? 'You can ask a new question now.'
    : 'Waiting for students to submit their answers.';

  const helperText = useMemo(() => {
    if (!activePoll) {
      return 'You will have the ability to create and manage polls, ask questions, and monitor responses in real-time.';
    }
    if (!canAskNew) {
      return 'A poll is live. Wait for students to respond before asking the next question.';
    }
    return 'You can ask a new question now.';
  }, [activePoll, canAskNew]);

  const handleOptionChange = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, text: value } : option))
    );
  };

  const handleCorrectChange = (id: string, isCorrect: boolean) => {
    setOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, isCorrect } : option))
    );
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: `${prev.length + 1}`, text: '', isCorrect: false },
    ]);
  };

  const handleCreatePoll = async () => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((option) => ({
      text: option.text.trim(),
      isCorrect: option.isCorrect,
    }));

    if (!trimmedQuestion || trimmedOptions.some((option) => !option.text)) {
      return;
    }

    setSubmitting(true);
    const response = await createPoll({
      question: trimmedQuestion,
      options: trimmedOptions,
      durationSeconds: duration,
    });
    setSubmitting(false);

    if (response.ok) {
      setQuestion('');
      setOptions(defaultOptions);
    }
  };

  return (
    <div className="page-split">
      <div className="main-panel">
        <div className="page-header">
          <BrandBadge />
          <button className="ghost-btn" type="button" onClick={() => navigate('/teacher/history')}>
            View Poll History
          </button>
        </div>

        {showCreate ? (
          <div className="form-card">
            <h1>Let's Get Started</h1>
            <p className="subtitle">{helperText}</p>

            <div className="input-group">
              <label htmlFor="question">Enter your question</label>
              <div className="question-row">
                <textarea
                  id="question"
                  placeholder="Type your question here"
                  maxLength={100}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <div className="timer-select">
                  <span>Duration</span>
                  <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                    {[30, 45, 60, 90].map((value) => (
                      <option key={value} value={value}>
                        {value} seconds
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="options-editor">
              <div className="options-head">
                <h3>Edit Options</h3>
                <span>Is it Correct?</span>
              </div>
              {options.map((option, index) => (
                <div key={option.id} className="option-edit-row">
                  <div className="option-input">
                    <span className="option-index">{index + 1}</span>
                    <input
                      type="text"
                      value={option.text}
                      placeholder="Option"
                      onChange={(event) => handleOptionChange(option.id, event.target.value)}
                    />
                  </div>
                  <div className="option-correct">
                    <div className="toggle-group">
                      <button
                        type="button"
                        className={option.isCorrect ? 'is-active' : ''}
                        onClick={() => handleCorrectChange(option.id, true)}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={!option.isCorrect ? 'is-active' : ''}
                        onClick={() => handleCorrectChange(option.id, false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="link-btn" type="button" onClick={addOption}>
                + Add more option
              </button>
            </div>

            <div className="form-actions">
              <button
                className="primary-btn"
                type="button"
                onClick={handleCreatePoll}
                disabled={!canAskNew || submitting}
              >
                {submitting ? 'Asking...' : 'Ask Question'}
              </button>
            </div>
          </div>
        ) : (
          <div className="poll-card">
            <div className="poll-header">
              <div>
                <div className="poll-title">Question</div>
                <h2>{activePoll?.question}</h2>
              </div>
              <TimerBadge time={formatTime(remainingSeconds)} />
            </div>
            {activePoll && (
              <ResultsList
                options={activePoll.options}
                results={pollState?.results || null}
                highlightCorrect
              />
            )}
            <p className="status-text">{statusMessage}</p>
          </div>
        )}
      </div>

      <div className="side-panel">
        <ChatPanel
          role="teacher"
          isOpen
          participants={participants}
          messages={messages}
          onSend={(message) => {
            sendMessage(message);
          }}
          onKick={(studentId) => {
            kickStudent(studentId);
          }}
        />
      </div>

      {error && <Toast message={error} onClose={clearError} />}
    </div>
  );
};
