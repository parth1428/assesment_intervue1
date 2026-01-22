import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoleSelect } from './pages/RoleSelect';
import { StudentOnboarding } from './pages/StudentOnboarding';
import { StudentLive } from './pages/StudentLive';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherHistory } from './pages/TeacherHistory';
import { KickedOut } from './pages/KickedOut';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/student" element={<StudentOnboarding />} />
          <Route path="/student/live" element={<StudentLive />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/history" element={<TeacherHistory />} />
          <Route path="/kicked" element={<KickedOut />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
