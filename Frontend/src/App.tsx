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

      </Routes>
    </Router>
  )
}

export default App
