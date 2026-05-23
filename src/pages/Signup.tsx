import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GuestOnlyRoute from "@/components/auth/GuestOnlyRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { formatAuthError } from "@/lib/auth-errors";
import { validatePassword, PASSWORD_HINT } from "@/lib/password-policy";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import AuthGoogleSection from "@/components/auth/AuthGoogleSection";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.message);
      return;
    }
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, fullName);
      if (needsEmailConfirmation) {
        toast.success(
          "Account created! Check your inbox and spam for a confirmation email from Tambua Africa Tours & Safaris, then sign in.",
          { duration: 8000 },
        );
        navigate("/login", { replace: true });
        return;
      }
      toast.success("Welcome to Tambua Africa!");
      navigate("/dashboard", { replace: true, state: { fromSignup: true } });
    } catch (err) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyRoute redirectTo="/dashboard">
      <PageTransition>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">Create account</h1>
                <p className="text-muted-foreground mt-2">
                  Join Tambua Africa. You will confirm your email before signing in.
                </p>
              </div>

              <AuthGoogleSection redirectPath="/dashboard" label="Sign up with Google" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <Input
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
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
                      placeholder={PASSWORD_HINT}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordRequirements password={password} className="mt-2" />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Create account with email
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Sign in
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

export default Signup;
