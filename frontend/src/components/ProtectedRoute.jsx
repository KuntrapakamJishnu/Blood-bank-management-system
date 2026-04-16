import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const validToken = isTokenValid();

  if (!validToken) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;