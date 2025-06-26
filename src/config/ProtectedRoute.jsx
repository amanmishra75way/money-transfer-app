import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to="/" />;

  if (adminOnly && !currentUser.isAdmin) return <Navigate to="/dashboard" />;

  return <Outlet />;
};

export default ProtectedRoute;
