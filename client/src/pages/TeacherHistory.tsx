import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../components/BrandBadge';
import { ResultsList } from '../components/ResultsList';
import type { Poll, PollResults } from '../types';

type HistoryItem = {
  poll: {
    _id: string;
    question: string;
    options: { _id: string; text: string; isCorrect: boolean }[];
    createdAt: string;
  };
  results: PollResults;
};

const mapPoll = (poll: HistoryItem['poll']): Poll => ({
  id: poll._id,
  question: poll.question,
  options: poll.options.map((option) => ({
    id: option._id,
    text: option.text,
    isCorrect: option.isCorrect,
  })),
  durationSeconds: 0,
  startTime: 0,
  endTime: 0,
  status: 'closed',
});

export const TeacherHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/polls/history');
        const data = await response.json();
        if (!data.ok) {
          setError(data.message || 'Unable to load poll history.');
        } else {
          setHistory(data.history || []);
        }
      } catch (err) {
        setError('Unable to load poll history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="page-scroll">
      <div className="page-header">
        <BrandBadge />
        <button className="ghost-btn" type="button" onClick={() => navigate('/teacher')}>
          Back to Live
        </button>
      </div>

      <h1>View Poll History</h1>
      {loading && <p className="subtitle">Loading past results...</p>}
      {error && <p className="subtitle error-text">{error}</p>}

      {!loading && !error && history.length === 0 && (
        <p className="subtitle">No poll history yet.</p>
      )}

      <div className="history-list">
        {history.map((item, index) => {
          const poll = mapPoll(item.poll);
          return (
            <div key={poll.id} className="history-card">
              <div className="poll-title">Question {index + 1}</div>
              <h2>{poll.question}</h2>
              <ResultsList options={poll.options} results={item.results} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
