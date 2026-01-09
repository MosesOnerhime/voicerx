import { type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { Navigate, Outlet } from 'react-router-dom';
import { type UserRole } from '../store/authSlice';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);

  // 1. If the app is still checking if we are logged in, show a loader
  // This prevents the "flash" of the login page
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 2. If no user and no token, go to login
  if (!user && !token) {
    return <Navigate to="/" replace />;
  }

  // 3. If user exists but role is wrong
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  return children ? <>{children}</> : <Outlet />;
};