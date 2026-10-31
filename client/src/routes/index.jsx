import { createBrowserRouter } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';

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
  // --- Public pages (with Navbar + Footer) ---
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
    ],
  },

  // --- User pages (login required) ---
  {
    element: <ProtectedRoute><PublicLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/my-courses', element: <MyCourses /> },
      { path: '/learn/:courseId', element: <CoursePlayer /> },
      { path: '/payments', element: <Payments /> },
      { path: '/profile', element: <Profile /> },
    ],
  },

  // --- Admin pages (admin role required) ---
  {
    element: <AdminRoute><PublicLayout /></AdminRoute>,
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
