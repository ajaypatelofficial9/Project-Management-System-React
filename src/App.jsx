import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

import UserLogin from './components/Login/index.jsx';
import UserSignup from './components/Signup/index.jsx';
import UserProfile from './components/Dashboard/index.jsx';
import HomePage from './components/Dashboard/homepage.jsx';
function App() {

  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  </>
}

export default App
