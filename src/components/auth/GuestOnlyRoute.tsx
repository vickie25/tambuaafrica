import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SuspenseFallback from "@/components/layout/SuspenseFallback";

interface GuestOnlyRouteProps {
  children: ReactNode;
  /** Where to send users who are already signed in */
  redirectTo?: string;
}

/** Login/signup pages only — redirects authenticated users away. */
const GuestOnlyRoute = ({ children, redirectTo = "/dashboard" }: GuestOnlyRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SuspenseFallback />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
