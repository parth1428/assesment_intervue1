import { useEffect, useState } from 'react';

export const usePollTimer = (endTime?: number, serverTime?: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!endTime || !serverTime) {
      setRemainingSeconds(0);
      return;
    }

    const offset = serverTime - Date.now();

    const update = () => {
      const remainingMs = Math.max(0, endTime - (Date.now() + offset));
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
    };

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [endTime, serverTime]);

  return remainingSeconds;
};
