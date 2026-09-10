import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RuralLogoLoader from './RuralLogoLoader';

export default function ProtectedRoute() {
  const { user, token, isLoading } = useAuth();

  if (isLoading || (token && !user)) {
    return (
      <RuralLogoLoader 
        size="screen" 
        text="RuralNex" 
        subtext="Securing your rural entrepreneurship portal..." 
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
