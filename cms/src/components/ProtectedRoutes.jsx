import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
    children,
    allowedRoles = [],
    redirectPath = '/sign-in'
}) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Not logged in → redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Role-based access control
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;