import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingPage } from './components/Common';
import Navbar from './components/Common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import AssignmentFormPage from './components/Assignments/AssignmentFormPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import AdminUsersPage from './components/Dashboard/AdminUsersPage';
import ProfilePage from './components/Dashboard/ProfilePage';
import CoursesPage from './components/Courses/CoursesPage';
import CourseDetailPage from './components/Courses/CourseDetailPage';
import CourseFormPage from './components/Courses/CourseFormPage';
import LessonPage from './components/Lessons/LessonPage';
import LessonFormPage from './components/Lessons/LessonFormPage';
import AssignmentPage from './components/Assignments/AssignmentPage';

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          {/* Auth required */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Courses (teacher/admin) */}
          <Route path="/courses/new" element={<PrivateRoute roles={['TEACHER','ADMIN']}><CourseFormPage /></PrivateRoute>} />
          <Route path="/courses/:id/edit" element={<PrivateRoute roles={['TEACHER','ADMIN']}><CourseFormPage /></PrivateRoute>} />

          {/* Lessons */}
          <Route path="/courses/:courseId/lessons/new" element={<PrivateRoute roles={['TEACHER','ADMIN']}><LessonFormPage /></PrivateRoute>} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId/edit" element={<PrivateRoute roles={['TEACHER','ADMIN']}><LessonFormPage /></PrivateRoute>} />

          {/* Assignments */}
          <Route path="/courses/:courseId/assignments/new" element={<PrivateRoute roles={['TEACHER','ADMIN']}><AssignmentFormPage /></PrivateRoute>} />
          <Route path="/courses/:courseId/assignments/:id" element={<PrivateRoute><AssignmentPage /></PrivateRoute>} />
          <Route path="/courses/:courseId/assignments/:id/edit" element={<PrivateRoute roles={['TEACHER','ADMIN']}><AssignmentFormPage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><AdminUsersPage /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        Mini LMS © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
