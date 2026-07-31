import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';

const Navbar = ({ title = 'Project Management' }) => {
    const userAuthData = useSelector(getUserAuthData);
    const navigate = useNavigate();

    const initials = userAuthData
        ? `${(userAuthData.firstName || '?')[0]}${(userAuthData.lastName || '')[0] || ''}`.toUpperCase()
        : '?';

    return (
        <nav className="navbar">
            <span className="navbar-title">{title}</span>
            <div className="navbar-user">
                <span>{userAuthData?.firstName} {userAuthData?.lastName}</span>
                <div
                    className="navbar-avatar"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/profile')}
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
                    title="View profile"
                    style={{ cursor: 'pointer' }}
                >
                    {userAuthData?.profileImageURL
                        ? <img src={userAuthData.profileImageURL} alt="avatar" />
                        : initials}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
