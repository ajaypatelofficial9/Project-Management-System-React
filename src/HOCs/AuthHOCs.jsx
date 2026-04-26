import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getUserAuthData } from '../redux/AuthSlice/index.slice.jsx';

export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const userAuthData = useSelector(getUserAuthData);

    const isAuthenticated = userAuthData && userAuthData.token && Object.keys(userAuthData).length > 0;
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <WrappedComponent {...props} />;
  };
};

export const withGuest = (WrappedComponent) => {
  return function GuestComponent(props) {
    const userAuthData = useSelector(getUserAuthData);
    const isAuthenticated = userAuthData && userAuthData.token && Object.keys(userAuthData).length > 0;
    if (isAuthenticated) {
      return <Navigate to="/profile" replace />;
    }
    return <WrappedComponent {...props} />;
  };
};