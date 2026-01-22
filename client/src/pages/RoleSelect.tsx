import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../components/BrandBadge';

export const RoleSelect = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  return (
    <div className="page-center">
      <BrandBadge />
      <h1>Welcome to the Live Polling System</h1>
      <p className="subtitle">
        Please select the role that best describes you to begin using the live polling system.
      </p>
      <div className="role-grid">
        <button
          type="button"
          className={`role-card ${role === 'student' ? 'selected' : ''}`}
          onClick={() => setRole('student')}
        >
          <h3>I'm a Student</h3>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </button>
        <button
          type="button"
          className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
          onClick={() => setRole('teacher')}
        >
          <h3>I'm a Teacher</h3>
          <p>Submit answers and view live poll results in real-time.</p>
        </button>
      </div>
      <button
        className="primary-btn"
        type="button"
        onClick={() => navigate(role === 'student' ? '/student' : '/teacher')}
      >
        Continue
      </button>
    </div>
  );
};
