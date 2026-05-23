import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { formatAuthError } from "@/lib/auth-errors";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success(
        "If that email is registered, Tambua Africa Tours & Safaris sent a reset link. Check your inbox and spam folder."
      );
    } catch (err) {
      toast.error(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2">We'll send you a link to reset your password</p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <Mail className="w-12 h-12 text-accent mx-auto" />
                <p className="text-foreground text-sm leading-relaxed">
                  Check your inbox for an email from <strong>Tambua Africa Tours &amp; Safaris</strong>.
                  If you do not see it within a few minutes, check spam or promotions.
                </p>
                <Link to="/login" className="text-accent hover:underline text-sm">Back to sign in</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5">
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-accent hover:underline">Back to sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default ForgotPassword;
