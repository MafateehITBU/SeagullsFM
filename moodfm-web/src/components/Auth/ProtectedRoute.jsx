import { Navigate } from "react-router-dom";
import Cookie from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const token = Cookie.get("token");

  if (!token) {
    // If no token → redirect to login
    return <Navigate to="/login" replace />;
  }

  // If token exists → allow access
  return children;
};

export default ProtectedRoute;
