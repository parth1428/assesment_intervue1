const STUDENT_NAME_KEY = 'intervue_student_name';
const STUDENT_ID_KEY = 'intervue_student_id';
const VOTED_POLLS_KEY = 'intervue_voted_polls';

export const getStudentName = () => sessionStorage.getItem(STUDENT_NAME_KEY) || '';

export const setStudentName = (name: string) => {
  sessionStorage.setItem(STUDENT_NAME_KEY, name);
};

export const getStudentId = () => sessionStorage.getItem(STUDENT_ID_KEY) || '';

export const setStudentId = (id: string) => {
  sessionStorage.setItem(STUDENT_ID_KEY, id);
};

export const getVotedPollIds = () => {
  const raw = sessionStorage.getItem(VOTED_POLLS_KEY);
  if (!raw) {
    return [] as string[];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as string[];
  }
};

export const addVotedPollId = (pollId: string) => {
  const ids = new Set(getVotedPollIds());
  ids.add(pollId);
  sessionStorage.setItem(VOTED_POLLS_KEY, JSON.stringify(Array.from(ids)));
};
