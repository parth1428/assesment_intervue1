export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `student-${Math.random().toString(16).slice(2)}-${Date.now()}`;
};
