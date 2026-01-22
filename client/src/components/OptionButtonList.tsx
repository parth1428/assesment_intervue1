import type { PollOption } from '../types';

export const OptionButtonList = ({
  options,
  selectedId,
  onSelect,
  disabled,
}: {
  options: PollOption[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="option-list">
      {options.map((option, index) => {
        const isSelected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`option-button ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
          >
            <span className="option-index">{index + 1}</span>
            <span className="option-text">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
};
