import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

export const ProtectedRoute = ({ allow }: { allow: Role[] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/supervisor"} replace />;
  }
  return <Outlet />;
};
