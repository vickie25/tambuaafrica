import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * Handles Supabase email confirmation (signup / email change).
 * Supabase redirects here with tokens in the hash or ?code= for PKCE.
 */
const AuthConfirm = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | undefined;

    const finishSuccess = () => {
      if (cancelled) return;
      setStatus("success");
      setMessage("Email confirmed! Taking you to your dashboard…");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    };

    const finishError = (detail: string) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(detail);
    };

    const run = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const hashError = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");

      if (hashError) {
        finishError(decodeURIComponent(hashError.replace(/\+/g, " ")));
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          finishError(error.message);
          return;
        }
        finishSuccess();
        return;
      }

      const hash = window.location.hash;
      const hasAuthFragment =
        hash.includes("access_token") ||
        hash.includes("type=signup") ||
        hash.includes("type=email") ||
        hash.includes("type=magiclink");

      if (hasAuthFragment) {
        subscription = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            finishSuccess();
          }
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          finishError(error.message);
          return;
        }
        if (session) {
          finishSuccess();
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        finishSuccess();
        return;
      }

      finishError("This confirmation link is invalid or has expired. Sign in or request a new confirmation email.");
    };

    void run();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
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
              <h1 className="text-xl font-bold text-foreground">Confirming your account</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">You&apos;re all set</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Confirmation failed</h1>
              <p className="text-muted-foreground mt-2 text-base">{message}</p>
              <Button asChild className="mt-6 w-full">
                <Link to="/login">Go to sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default AuthConfirm;
