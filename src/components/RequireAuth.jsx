import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAuth;
