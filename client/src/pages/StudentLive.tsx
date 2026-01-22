import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../components/BrandBadge';
import { ChatPanel } from '../components/ChatPanel';
import { OptionButtonList } from '../components/OptionButtonList';
import { ResultsList } from '../components/ResultsList';
import { TimerBadge } from '../components/TimerBadge';
import { Toast } from '../components/Toast';
import { usePollTimer } from '../hooks/usePollTimer';
import { useSocket } from '../hooks/useSocket';
import { addVotedPollId, getStudentId, getStudentName, getVotedPollIds } from '../utils/session';
import { formatTime } from '../utils/time';

export const StudentLive = () => {
  const navigate = useNavigate();
  const name = getStudentName();
  const studentId = getStudentId();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedPollIds, setVotedPollIds] = useState<string[]>(getVotedPollIds());

  const {
    pollState,
    participants,
    messages,
    submitVote,
    sendMessage,
    error,
    clearError,
    kicked,
  } = useSocket({
    role: 'student',
    name,
    studentId,
    enabled: Boolean(name && studentId),
  });

  useEffect(() => {
    if (!name || !studentId) {
      navigate('/student');
    }
  }, [name, studentId, navigate]);

  useEffect(() => {
    if (kicked) {
      navigate('/kicked');
    }
  }, [kicked, navigate]);

  const pollId = pollState?.poll?.id;
  const remainingSeconds = usePollTimer(pollState?.poll?.endTime, pollState?.serverTime);

  useEffect(() => {
    setSelectedOption(null);
  }, [pollId]);

  const hasVoted = useMemo(() => {
    if (!pollId) {
      return false;
    }
    return votedPollIds.includes(pollId);
  }, [pollId, votedPollIds]);

  const showOptions =
    pollState?.poll &&
    pollState.poll.status === 'active' &&
    remainingSeconds > 0 &&
    !hasVoted;

  const showResults = Boolean(pollState?.poll) && !showOptions;

  const statusMessage = pollState?.poll
    ? showOptions
      ? 'Submit your answer before the timer ends.'
      : 'Wait for the teacher to ask a new question.'
    : 'Wait for the teacher to ask a new question.';

  const handleSubmit = async () => {
    if (!pollId || !selectedOption) {
      return;
    }
    setIsSubmitting(true);
    const response = await submitVote({ pollId, optionId: selectedOption });
    setIsSubmitting(false);

    if (response.ok) {
      addVotedPollId(pollId);
      setVotedPollIds(getVotedPollIds());
    }
  };

  return (
    <div className="page-live">
      <div className="main-panel">
        <BrandBadge />
        {pollState?.poll ? (
          <div className="poll-card">
            <div className="poll-header">
              <div>
                <div className="poll-title">Question</div>
                <h2>{pollState.poll.question}</h2>
              </div>
              <TimerBadge time={formatTime(remainingSeconds)} />
            </div>

            {showOptions && (
              <>
                <OptionButtonList
                  options={pollState.poll.options}
                  selectedId={selectedOption}
                  onSelect={setSelectedOption}
                  disabled={isSubmitting}
                />
                <button
                  className="primary-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedOption || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </>
            )}

            {showResults && (
              <ResultsList options={pollState.poll.options} results={pollState.results} />
            )}
          </div>
        ) : (
          <div className="poll-card empty">
            <h2>Waiting for the teacher</h2>
            <p>The next question will appear here as soon as it starts.</p>
          </div>
        )}

        <p className="status-text">{statusMessage}</p>
      </div>

      <button className="chat-fab" type="button" onClick={() => setChatOpen(true)}>
        Chat
      </button>

      <ChatPanel
        role="student"
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        participants={participants}
        messages={messages}
        onSend={(message) => {
          sendMessage(message);
        }}
      />

      {error && <Toast message={error} onClose={clearError} />}
    </div>
  );
};
