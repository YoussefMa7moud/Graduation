
import './App.css'
import LandingPage from './pages/LandingPage/LandingPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './pages/customer/HomePage'
import BrowsePage from './pages/customer/BrowsePage';
import ContractsPage from './pages/customer/ContractsPage';
import ChatPage from './pages/customer/ChatPage';
import Auth from "./pages/Auth/Auth";
function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<HomePage />} />
         <Route path="/Auth" element={<Auth />} />
        <Route path="/Browse" element={<BrowsePage />} />
        <Route path="/Contracts" element={<ContractsPage/>} />
        <Route path="/Chat" element={<ChatPage />}/>
      </Routes>
    </Router>
  )
}

export default App
