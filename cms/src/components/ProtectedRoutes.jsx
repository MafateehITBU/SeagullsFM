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

    // Admin permission check
    // if (user.role === 'admin') {
    //     if (location.pathname !== '/') {
    //         const pathSegment = location.pathname.split('/')[1]; // e.g. 'users'
    //         const requiredPermission = pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1); // → 'Users'

    //         if (!user.permissions || !user.permissions.includes(requiredPermission)) {
    //             return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    //         }
    //     }
    // }

    return children;
};

export default ProtectedRoute;