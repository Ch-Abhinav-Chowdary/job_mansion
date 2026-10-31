import { createBrowserRouter } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public pages
import Home from '../pages/public/Home';
import Courses from '../pages/public/Courses';
import CourseDetail from '../pages/public/CourseDetail';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import NotFound from '../pages/public/NotFound';

// User pages
import Dashboard from '../pages/user/Dashboard';
import MyCourses from '../pages/user/MyCourses';
import CoursePlayer from '../pages/user/CoursePlayer';
import Payments from '../pages/user/Payments';
import Profile from '../pages/user/Profile';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCourses from '../pages/admin/Courses';
import CourseForm from '../pages/admin/CourseForm';
import Students from '../pages/admin/Students';
import AdminPayments from '../pages/admin/Payments';
import Enquiries from '../pages/admin/Enquiries';

const router = createBrowserRouter([
  // --- Public pages (with PublicLayout) ---
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/courses', element: <Courses /> },
      { path: '/courses/:slug', element: <CourseDetail /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },

      // --- Protected student pages (using PublicLayout) ---
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-courses',
        element: (
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: '/learn/:courseSlug',
        element: (
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payments',
        element: (
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },

      // Catch-all 404
      { path: '*', element: <NotFound /> },
    ],
  },

  // --- Admin portal (AdminRoute + AdminLayout) ---
  {
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/courses', element: <AdminCourses /> },
      { path: '/admin/courses/new', element: <CourseForm /> },
      { path: '/admin/courses/:id/edit', element: <CourseForm /> },
      { path: '/admin/students', element: <Students /> },
      { path: '/admin/payments', element: <AdminPayments /> },
      { path: '/admin/enquiries', element: <Enquiries /> },
    ],
  },
]);

export default router;
