import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SuspenseFallback from "@/components/layout/SuspenseFallback";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If auth is loading, show fallback
  if (loading) {
    return <SuspenseFallback />;
  }

  if (!user) {
    const fromSignup = Boolean((location.state as { fromSignup?: boolean } | null)?.fromSignup);
    if (fromSignup) {
      return <SuspenseFallback />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
