/**
 * Role-Based Route Component v2.0
 *
 * This component protects routes by checking if the authenticated user has one of the allowed roles.
 * It's now fully type-safe and relies on the normalized roles from AuthContext.
 */

import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasAnyRole, getDefaultHomeRoute } from '../../utils/role.utils';
import type { FrontendRole } from '../../utils/role.utils';

interface RoleBasedRouteProps {
  children: ReactNode;
  /**
   * Array of roles that are allowed to access this route.
   */
  allowedRoles: readonly FrontendRole[];
  /**
   * Optional: A custom path to redirect to if the user's role is not allowed.
   * If not provided, it will redirect to the user's default home route.
   */
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles, redirectTo }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. Show a loading state while authentication status is being determined.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verifying access...</span>
        </div>
      </div>
    );
  }

  // 2. If not authenticated or user object is missing, redirect to the login page.
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Check if the user's role is in the list of allowed roles.
  const userRole = user.role;
  const hasAccess = hasAnyRole(userRole, allowedRoles);

  // 4. If the user does not have access, determine the redirect path.
  if (!hasAccess) {
    // Use the custom redirect path if provided, otherwise get the default for the user's role.
    // getDefaultHomeRoute will safely handle 'unknown' roles and redirect to '/auth'.
    const redirectPath = redirectTo || getDefaultHomeRoute(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  // 5. If all checks pass, render the protected content.
  return <>{children}</>;
};

export default RoleBasedRoute;
