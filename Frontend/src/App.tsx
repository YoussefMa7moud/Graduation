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
import BrowseCompanies from './pages/Client/BrowseCompanies';
import MyProposals from './pages/Client/MyProposals';
import ClientLayout from './components/Client/ClientLayout';
import CreateProposal from './pages/Client/CreateProposal';
import ClientAccountSettings from './pages/Client/ClientAccountSettings';
import ProposalSubmission from './pages/Client/ProposalSubmission';
import OngoingProjects from './pages/Client/OngoingProjects';
import SignedProjects from './pages/Client/SignedProjects';
import ActiveProjects from './pages/Client/ActiveProjects';
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

      <Route path="/BrowseCompanies" element={
      <ClientLayout>
            <BrowseCompanies />
          </ClientLayout>
   
      } />

      <Route path="/proposals" element={
 
          <ClientLayout>
            <MyProposals />
          </ClientLayout>
    
      } />

      <Route path="/proposals/new" element={
     
          <ClientLayout>
            <CreateProposal />
          </ClientLayout>
  
      } />
      <Route path="/settings" element={
       
          <ClientLayout><ClientAccountSettings /></ClientLayout>
   
      } />
      
      <Route
  path="/proposals/submission"
  element={
    <ClientLayout>
      <ProposalSubmission />
    </ClientLayout>
  }
/>
<Route 
  path="/OngoingProjects"
  element={
  
      <ClientLayout>
        <OngoingProjects />
      </ClientLayout>
   
  }
/>
<Route 
  path="/SignedProjects"
  element={
  
      <ClientLayout>
        <SignedProjects />
      </ClientLayout>
   
  }
/>
   <Route 
  path="/ActiveProjects"
  element={
  
      <ClientLayout>
        <ActiveProjects />
      </ClientLayout>
   
  }
/>   </Routes>
   
  )
}

/**
 * Main App Component
 * Wraps the application with AuthProvider and Router
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
