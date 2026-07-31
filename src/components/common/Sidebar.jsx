import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logoutUserAuthAction, getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import baseRoutes from '../../constants/routes.js';

const NAV_ADMIN = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '📁', label: 'Projects', path: '/projects' },
    { icon: '✅', label: 'All Tasks', path: '/tasks' },
    { icon: '👤', label: 'Profile', path: '/profile' },
];

const NAV_USER = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '📁', label: 'My Projects', path: '/projects' },
    { icon: '👤', label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin = userAuthData?.role === 'admin';

    const navItems = isAdmin ? NAV_ADMIN : NAV_USER;

    const handleLogout = () => {
        dispatch(logoutUserAuthAction());
        toast.success('Logged out successfully');
        navigate(baseRoutes.loginPage);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-logo-icon">🚀</span>
                <span className="sidebar-logo-text">ProjectMS</span>
            </div>

            <nav className="sidebar-nav" aria-label="Main navigation">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`sidebar-item${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? ' active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                        <span className="sidebar-item-icon">{item.icon}</span>
                        <span className="sidebar-item-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                    <span className="sidebar-item-icon">🚪</span>
                    <span className="sidebar-item-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
