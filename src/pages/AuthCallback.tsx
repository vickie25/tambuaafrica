import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { consumeAuthRedirect } from "@/lib/auth-redirect";
import { waitForSessionFromUrl } from "@/lib/auth-session-from-url";

/**
 * Handles OAuth return (Google sign-in). Supabase client exchanges ?code= via detectSessionInUrl.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    let cancelled = false;

    const cleanup = waitForSessionFromUrl({
      cancelled: () => cancelled,
      onSuccess: () => {
        const target = consumeAuthRedirect();
        setStatus("success");
        setMessage("Signed in! Taking you to your dashboard…");
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => navigate(target, { replace: true }), 600);
      },
      onError: (detail) => {
        setStatus("error");
        setMessage(detail);
      },
      timeoutMessage:
        "Sign in could not be completed. Open the site on one address only (for example always tambua-africa.com or always tambuaafrica.com), then try Google again.",
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [navigate]);

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Signing you in</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Welcome</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Sign in failed</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
              <Button asChild className="mt-6 w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default AuthCallback;
