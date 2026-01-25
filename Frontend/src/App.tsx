import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from "./pages/LandingPage/LandingPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth/AuthPage";
import CompanyHome from "./pages/Company/CompanyHome";
import DashboardLayout from "./components/Company/DashboardLayout";
import PolicyConverter from "./pages/Company/PolicyConverter";
import MyPolicyRepository from "./pages/Company/MyPolicyRepository";
import ClientRequests from "./pages/Company/ClientRequests";
import CompanySettings from "./pages/Company/CompanySettings";
import ContractRepository from "./pages/Company/ContractRepository";
import RoleBasedRoute from "./components/Auth/RoleBasedRoute";
import { RoleGroups, getDefaultHomeRoute } from "./utils/role.utils";
import OngoingContracts from "./pages/Company/OngoingContracts";
import BrowseCompanies from "./pages/Client/BrowseCompanies";
import MyProposals from "./pages/Client/MyProposals";
import ClientLayout from "./components/Client/ClientLayout";
import CreateProposal from "./pages/Client/CreateProposal";
import ClientAccountSettings from "./pages/Client/ClientAccountSettings";
import OngoingProjects from "./pages/Client/OngoingProjects";
import SignedProjects from "./pages/Client/SignedProjects";
import ActiveProjects from "./pages/Client/ActiveProjects";
import LoadingAnimation from "./components/LoadingAnimation";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget the CSS!
import ProposalFeedback from "./pages/Client/MangeProject/ProposalFeedback";
import NDASigning from "./pages/Client/MangeProject/NDASigning";
/**
 * Component that redirects authenticated users away from auth pages
 */
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();




  if (isLoading) {
    return (
     <LoadingAnimation />
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
      <Route path="/toast" element={<ToastContainer />} />
      
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

   <Route 
        path="OngoingContracts"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
            <DashboardLayout>
              <OngoingContracts />
            </DashboardLayout>
          </RoleBasedRoute>
        }
      />








      {/* Clients Routes - Only accessible by CLIENT role */}






      <Route
        path="/BrowseCompanies"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <BrowseCompanies />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/proposals"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <MyProposals />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/proposals/new"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <CreateProposal />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <ClientAccountSettings />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

     

      <Route
        path="/OngoingProjects"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <OngoingProjects />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/SignedProjects"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <SignedProjects />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/ActiveProjects"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <ActiveProjects />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />





          <Route
        path="/ProposalFeedback"
        element={
          <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
            <ClientLayout>
              <ProposalFeedback />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />




            <Route
        path="/NDASigning"
        element={
          <RoleBasedRoute allowedRoles={[...RoleGroups.CLIENT, ...RoleGroups.COMPANY]}>
            <ClientLayout>
              <NDASigning />
            </ClientLayout>
          </RoleBasedRoute>
        }
      />



      
    </Routes>



  

















  );
};

/**
 * Main App Component
 * Wraps the application with AuthProvider and Router
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
