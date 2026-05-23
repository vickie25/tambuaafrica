import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return <SuspenseFallback />;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
