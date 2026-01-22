import type { PollOption, PollResults } from '../types';

const getPercentage = (count: number, total: number) => {
  if (!total) {
    return 0;
  }
  return Math.round((count / total) * 100);
};

export const ResultsList = ({
  options,
  results,
  highlightCorrect,
}: {
  options: PollOption[];
  results: PollResults | null;
  highlightCorrect?: boolean;
}) => {
  const total = results?.total || 0;

  return (
    <div className="result-list">
      {options.map((option, index) => {
        const count = results?.counts[option.id] || 0;
        const percentage = getPercentage(count, total);
        return (
          <div
            key={option.id}
            className={`result-row ${highlightCorrect && option.isCorrect ? 'is-correct' : ''}`}
          >
            <div className="result-info">
              <span className="option-index">{index + 1}</span>
              <span className="option-text">{option.text}</span>
            </div>
            <div className="result-bar">
              <div className="result-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="result-meta">{percentage}%</div>
          </div>
        );
      })}
    </div>
  );
};
