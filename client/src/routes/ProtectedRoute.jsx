import { Navigate, useLocation } from 'react-router-dom';

/**
 * Redirects to /login if user is not authenticated.
 * TODO: wire up to AuthContext once auth is built.
 */
const ProtectedRoute = ({ children }) => {
  // Placeholder: always allow for now
  const isAuthenticated = true;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
