import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../components/BrandBadge';
import { createId } from '../utils/id';
import { getStudentId, getStudentName, setStudentId, setStudentName } from '../utils/session';

export const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(getStudentName());

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setStudentName(trimmed);

    let studentId = getStudentId();
    if (!studentId) {
      studentId = createId();
      setStudentId(studentId);
    }

    navigate('/student/live');
  };

  return (
    <div className="page-center">
      <BrandBadge />
      <h1>Let's Get Started</h1>
      <p className="subtitle">
        If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.
      </p>
      <div className="input-group">
        <label htmlFor="student-name">Enter your Name</label>
        <input
          id="student-name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <button className="primary-btn" type="button" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};
