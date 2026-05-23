import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { ADMIN_LOGIN_EMAIL } from "@/lib/admin-email";
import { formatAuthError } from "@/lib/auth-errors";
import GuestOnlyRoute from "@/components/auth/GuestOnlyRoute";
import AuthGoogleSection from "@/components/auth/AuthGoogleSection";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirectQuery = searchParams.get("redirect");
  const redirectTarget =
    (fromState?.pathname ? `${fromState.pathname}${fromState.search || ""}` : null) ||
    redirectQuery ||
    "/dashboard";
  const isAdminLogin = redirectTarget === "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAdminLogin && !email) {
      setEmail(ADMIN_LOGIN_EMAIL);
    }
  }, [email, isAdminLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyRoute redirectTo={redirectTarget}>
      <PageTransition>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {isAdminLogin ? "Admin sign in" : "Welcome back"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {isAdminLogin
                    ? "Use your Tambua Africa admin email and password, or Google if enabled for that account."
                    : "Sign in to manage your safari bookings"}
                </p>
              </div>

              <AuthGoogleSection redirectPath={redirectTarget} />

              <form onSubmit={handleSubmit} className="space-y-4">
                {isAdminLogin && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
                    Admin email:{" "}
                    <span className="font-medium text-foreground">{ADMIN_LOGIN_EMAIL}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder={isAdminLogin ? ADMIN_LOGIN_EMAIL : "you@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  Sign in with email
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-accent font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </PageTransition>
    </GuestOnlyRoute>
  );
};

export default Login;
