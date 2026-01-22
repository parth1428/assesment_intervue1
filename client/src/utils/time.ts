export const formatTime = (seconds: number) => {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  const padded = secs.toString().padStart(2, '0');
  return `${mins}:${padded}`;
};
