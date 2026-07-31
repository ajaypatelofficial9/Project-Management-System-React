import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logoutUserAuthAction, getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import baseRoutes from '../../constants/routes.js';

// Minimal inline SVG icons — no emojis, no icon libraries needed
const Icon = {
    dashboard: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M2 2h5v5H2zm0 7h5v5H2zm7-7h5v5H9zm0 7h5v5H9z"/>
        </svg>
    ),
    projects: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M1 3a1 1 0 011-1h4l2 2h6a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V3z"/>
        </svg>
    ),
    tasks: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M2 2h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/>
        </svg>
    ),
    users: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z"/>
        </svg>
    ),
    profile: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM4 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4z"/>
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M10 2H3a1 1 0 00-1 1v10a1 1 0 001 1h7v-2H4V4h6V2zm1 3l4 3-4 3V9H6V7h5V5z"/>
        </svg>
    ),
};

const NAV_ADMIN = [
    { icon: Icon.dashboard, label: 'Dashboard',  path: '/dashboard' },
    { icon: Icon.projects,  label: 'Projects',   path: '/projects' },
    { icon: Icon.tasks,     label: 'All Tasks',  path: '/tasks' },
    { icon: Icon.users,     label: 'Users',      path: '/users' },
    { icon: Icon.profile,   label: 'Profile',    path: '/profile' },
];

const NAV_USER = [
    { icon: Icon.dashboard, label: 'Dashboard',    path: '/dashboard' },
    { icon: Icon.projects,  label: 'My Projects',  path: '/projects' },
    { icon: Icon.profile,   label: 'Profile',      path: '/profile' },
];

const Sidebar = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const dispatch  = useDispatch();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin   = userAuthData?.role === 'admin';
    const navItems  = isAdmin ? NAV_ADMIN : NAV_USER;

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(logoutUserAuthAction());
        toast.success('Logged out');
        navigate(baseRoutes.loginPage);
    };

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-dot" />
                <span className="sidebar-logo-text">ProjectMS</span>
            </div>

            <nav className="sidebar-nav" aria-label="Main navigation">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`sidebar-item${isActive(item.path) ? ' active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                        <span className="sidebar-item-icon">{item.icon}</span>
                        <span className="sidebar-item-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-divider" />
                <button
                    className="sidebar-item"
                    onClick={handleLogout}
                    style={{ color: 'var(--danger)' }}
                >
                    <span className="sidebar-item-icon">{Icon.logout}</span>
                    <span className="sidebar-item-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
