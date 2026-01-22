
export const TimerBadge = ({ time }: { time: string }) => {
  return (
    <div className="timer-badge">
      <span className="timer-icon" aria-hidden="true" />
      <span>{time}</span>
    </div>
  );
};
