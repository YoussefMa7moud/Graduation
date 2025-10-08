
import './App.css'
import LandingPage from './pages/LandingPage/LandingPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './pages/customer/HomePage'
import BrowsePage from './pages/customer/BrowsePage';

function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Browse" element={<BrowsePage />} />
      </Routes>
    </Router>
  )
}

export default App
