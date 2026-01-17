import './App.css'
import LandingPage from './pages/LandingPage/LandingPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Auth from './pages/Auth/AuthPage';
import CompanyHome from './pages/Company/CompanyHome';
import DashboardLayout from './components/Company/DashboardLayout';
import PolicyConverter from './pages/Company/PolicyConverter';
import MyPolicyRepository from './pages/Company/MyPolicyRepository';
import ClientRequests from './pages/Company/ClientRequests';
import CompanySettings from './pages/Company/CompanySettings';
import ContractRepository from './pages/Company/ContractRepository';
import BrowseCompanies from './pages/Client/BrowseCompanies';
import MyProposals from './pages/Client/MyProposals';
import ClientLayout from './components/Client/ClientLayout';
import CreateProposal from './pages/Client/CreateProposal';
import ClientAccountSettings from './pages/Client/ClientAccountSettings';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />

        <Route path="/CompanyHome" element={
          <DashboardLayout>
            <CompanyHome />
          </DashboardLayout>
        } />

        <Route path="/PolicyConverter" element={
          <DashboardLayout>
            <PolicyConverter />
          </DashboardLayout>
        } />

        <Route path="/MyPolicyRepository" element={
          <DashboardLayout>
            <MyPolicyRepository />
          </DashboardLayout>
        } />

          <Route path="/ClientRequests" element={
          <DashboardLayout>
            <ClientRequests />
          </DashboardLayout>
        } />


         <Route path="/ClientRequests" element={
          <DashboardLayout>
            <ClientRequests />
          </DashboardLayout>
        } />

         <Route path="/CompanySettings" element={
          <DashboardLayout>
            <CompanySettings />
          </DashboardLayout>
        } />


         <Route path="/ContractRepository" element={
          <DashboardLayout>
            <ContractRepository />
          </DashboardLayout>
        } />
<Route path="/client/companies" element={
  <ClientLayout>
    <BrowseCompanies />
  </ClientLayout>
} />

<Route path="/client/proposals" element={
  <ClientLayout>
    <MyProposals />
  </ClientLayout>
} />
<Route path="/client/proposals/new" element={
  <ClientLayout>
    <CreateProposal />
  </ClientLayout>
} />
   <Route path="/ClientSettings" element={<ClientAccountSettings />} />
      
      
      </Routes>
    </Router>
  )
}

export default App
