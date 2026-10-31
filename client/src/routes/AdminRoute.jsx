import { Navigate } from 'react-router-dom';

/**
 * Redirects to / if user is not an admin.
 * TODO: wire up to AuthContext once auth is built.
 */
const AdminRoute = ({ children }) => {
  // Placeholder: always allow for now
  const isAdmin = true;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
