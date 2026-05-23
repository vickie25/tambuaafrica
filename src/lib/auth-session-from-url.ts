import { supabase } from "@/integrations/supabase/client";

type WaitOptions = {
  cancelled: () => boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
  timeoutMs?: number;
  timeoutMessage?: string;
};

/**
 * Wait for Supabase to finish PKCE / hash handling (detectSessionInUrl).
 * Do not call exchangeCodeForSession here — that races the client and clears the verifier.
 */
export function waitForSessionFromUrl({
  cancelled,
  onSuccess,
  onError,
  timeoutMs = 10_000,
  timeoutMessage = "Sign in could not be completed. Try again from the login page.",
}: WaitOptions): () => void {
  const hashError = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  ).get("error_description");

  if (hashError) {
    onError(decodeURIComponent(hashError.replace(/\+/g, " ")));
    return () => {};
  }

  let finished = false;

  const finishOnce = (fn: () => void) => {
    if (finished || cancelled()) return;
    finished = true;
    fn();
  };

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (cancelled()) return true;
    if (error) {
      finishOnce(() => onError(error.message));
      return true;
    }
    if (session) {
      finishOnce(onSuccess);
      return true;
    }
    return false;
  };

  void checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (cancelled() || finished) return;
      if (
        session &&
        (event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "TOKEN_REFRESHED")
      ) {
        finishOnce(onSuccess);
      }
    },
  );

  const timeout = window.setTimeout(() => {
    void (async () => {
      if (finished || cancelled()) return;
      if (!(await checkSession())) {
        finishOnce(() => onError(timeoutMessage));
      }
    })();
  }, timeoutMs);

  return () => {
    subscription.unsubscribe();
    window.clearTimeout(timeout);
  };
}
