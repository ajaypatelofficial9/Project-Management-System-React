import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import UserLogin from './components/Login/index.jsx';
import UserSignup from './components/Signup/index.jsx';
import UserProfile from './components/Dashboard/index.jsx';
import HomePage from './components/Dashboard/homepage.jsx';
import { withAuth, withGuest } from './HOCs/AuthHOCs.jsx';

const AuthenticatedUserProfile = withAuth(UserProfile);
const GuestUserLogin = withGuest(UserLogin);
const GuestUserSignup = withGuest(UserSignup);

function App() {

  return <>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<GuestUserLogin />} />
        <Route path="/signup" element={<GuestUserSignup />} />
        <Route path="/profile" element={<AuthenticatedUserProfile />} />
      </Routes>
    </BrowserRouter>
  </>
}

export default App
