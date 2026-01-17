import './App.css'
import LandingPage from './pages/LandingPage/LandingPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth/AuthPage';
import CompanyHome from './pages/Company/CompanyHome';
import DashboardLayout from './components/Company/DashboardLayout';
import PolicyConverter from './pages/Company/PolicyConverter';
import MyPolicyRepository from './pages/Company/MyPolicyRepository';
import ClientRequests from './pages/Company/ClientRequests';
import CompanySettings from './pages/Company/CompanySettings';
import ContractRepository from './pages/Company/ContractRepository';
import RoleBasedRoute from './components/Auth/RoleBasedRoute';
import { RoleGroups, getDefaultHomeRoute } from './utils/role.utils';

/**
 * Component that redirects authenticated users away from auth pages
 */
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect them away from the auth page.
  if (isAuthenticated && user) {
    // getDefaultHomeRoute can handle any role, including 'unknown'
    const homeRoute = getDefaultHomeRoute(user.role);
    return <Navigate to={homeRoute} replace />;
  }

  // If not authenticated, show the children (the Auth page)
  return <>{children}</>;
};

/**
 * Main App Routes Component
 * Separated to use useAuth hook inside Router context
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/auth" 
        element={
          <AuthRedirect>
            <Auth />
          </AuthRedirect>
        } 
      />

      {/* Company Routes - Only accessible by COMPANY role */}
      <Route 
        path="/CompanyHome" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <CompanyHome />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/PolicyConverter" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <PolicyConverter />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/MyPolicyRepository" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <MyPolicyRepository />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/ClientRequests" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <ClientRequests />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/CompanySettings" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <CompanySettings />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      <Route 
        path="/ContractRepository" 
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <ContractRepository />
            </DashboardLayout>
          </RoleBasedRoute>
        } 
      />

      {/* Client Routes - Only accessible by CLIENT roles (to be implemented later) */}
      {/* 
      <Route 
        path="/ClientHome" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
              <ClientDashboardLayout>
                <ClientHome />
              </ClientDashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      */}

      {/* Admin Routes - Only accessible by ADMIN role (to be implemented later) */}
      {/* 
      <Route 
        path="/AdminHome" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={RoleGroups.ADMIN}>
              <AdminDashboardLayout>
                <AdminHome />
              </AdminDashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      */}

      {/* Project Manager Routes - Only accessible by PROJECT_MANAGER role (to be implemented later) */}
      {/* 
      <Route 
        path="/ProjectManagerHome" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={RoleGroups.PROJECT_MANAGER}>
              <ProjectManagerDashboardLayout>
                <ProjectManagerHome />
              </ProjectManagerDashboardLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />
      */}

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App Component
 * Wraps the application with AuthProvider and Router
 */
function App() {
  try {
    return (
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    );
  } catch (error) {
    console.error('App initialization error:', error);
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Application Error</h1>
        <p>An error occurred while loading the application.</p>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}

export default App
