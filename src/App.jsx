import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UserLogin from './components/Login/index.jsx';
import UserSignup from './components/Signup/index.jsx';
import UserProfile from './components/Dashboard/index.jsx';
import DashboardPage from './components/Dashboard/DashboardPage.jsx';
import ProjectsPage from './components/Projects/ProjectsPage.jsx';
import ProjectDetailPage from './components/Projects/ProjectDetailPage.jsx';
import TasksPage from './components/Tasks/TasksPage.jsx';
import TaskDetailPage from './components/Tasks/TaskDetailPage.jsx';
import UsersPage from './components/Users/UsersPage.jsx';
import { withAuth, withGuest, withAdmin } from './HOCs/AuthHOCs.jsx';

// Wrap with appropriate guards
const AuthDashboard = withAuth(DashboardPage);
const AuthProjects = withAuth(ProjectsPage);
const AuthProjectDetail = withAuth(ProjectDetailPage);
const AuthTasks = withAdmin(TasksPage);
const AuthTaskDetail = withAuth(TaskDetailPage);
const AuthProfile = withAuth(UserProfile);
const AuthUsers = withAdmin(UsersPage);
const GuestLogin = withGuest(UserLogin);
const GuestSignup = withGuest(UserSignup);

function App() {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
            />
            <BrowserRouter>
                <Routes>
                    {/* Public / guest routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<GuestLogin />} />
                    <Route path="/signup" element={<GuestSignup />} />

                    {/* Authenticated routes */}
                    <Route path="/dashboard" element={<AuthDashboard />} />
                    <Route path="/projects" element={<AuthProjects />} />
                    <Route path="/projects/:id" element={<AuthProjectDetail />} />
                    <Route path="/tasks" element={<AuthTasks />} />
                    <Route path="/tasks/:id" element={<AuthTaskDetail />} />
                    <Route path="/users" element={<AuthUsers />} />
                    <Route path="/profile" element={<AuthProfile />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
