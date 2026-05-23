import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { isAdminMailbox } from "@/lib/admin-email";
import { getAuthSiteOrigin, getEmailConfirmRedirectUrl } from "@/lib/auth-redirect";
import { formatAuthError } from "@/lib/auth-errors";
import { isLiveDataPath } from "@/lib/site-snapshot";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  role: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const needsAuthImmediately = isLiveDataPath(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(needsAuthImmediately);

  const fetchRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }

      if (data) {
        console.log("Fetched role for user:", userId, "=>", data.role);
        setRole(data.role);
        return data.role;
      }
    } catch (err) {
      console.error("Unexpected error fetching role:", err);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!hasSupabaseEnv) {
          return;
        }

        if (!needsAuthImmediately) {
          setLoading(false);
        }

        const fetchSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          return session;
        };

        let session = null;
        try {
          session = await fetchSession();
        } catch (err) {
          console.warn("Supabase session fetch failed, proceeding with null session.");
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Fetch role in background, don't block loading
            fetchRole(session.user.id).catch(roleErr => {
              console.warn("Role fetch failed, proceeding with default permissions.");
            });
          } else {
            setRole(null);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    if (!hasSupabaseEnv) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state change:", _event, session?.user?.id);
      try {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("User logged in, fetching role...");
            // Fetch role in background, don't block loading
            fetchRole(session.user.id).catch(roleErr => {
              console.warn("Role fetch failed, proceeding with default permissions.");
            });
          } else {
            console.log("User logged out");
            setRole(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [needsAuthImmediately]);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!hasSupabaseEnv) {
      throw new Error(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a saved .env file in the project root (use your Supabase anon public key from Dashboard → API), then restart the dev server. On Vercel, set the same variables in Project Settings → Environment Variables."
      );
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getEmailConfirmRedirectUrl(),
      },
    });
    if (error) throw error;

    let session = data.session ?? null;

    // When confirm-email is off, Supabase may return a user without a session — sign in immediately.
    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError && signInData.session) {
        session = signInData.session;
      }
    }

    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData.session ?? null;
    }

    if (session) {
      setSession(session);
      setUser(session.user);
      if (session.user) {
        fetchRole(session.user.id).catch(() => undefined);
      }
      return { needsEmailConfirmation: false };
    }

    return { needsEmailConfirmation: Boolean(data.user) };
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseEnv) {
      throw new Error(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a saved .env file in the project root (use your Supabase anon public key from Dashboard → API), then restart the dev server. On Vercel, set the same variables in Project Settings → Environment Variables."
      );
    }
    console.log("Attempting sign in for:", email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    console.log("Sign in successful");
  };

  const signOut = async () => {
    if (!hasSupabaseEnv) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    if (!hasSupabaseEnv) {
      throw new Error(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a saved .env file in the project root (use your Supabase anon public key from Dashboard → API), then restart the dev server. On Vercel, set the same variables in Project Settings → Environment Variables."
      );
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAuthSiteOrigin()}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    if (!hasSupabaseEnv) {
      throw new Error(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a saved .env file in the project root (use your Supabase anon public key from Dashboard → API), then restart the dev server. On Vercel, set the same variables in Project Settings → Environment Variables."
      );
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const isAdmin = role?.toLowerCase() === "admin" || isAdminMailbox(user?.email);

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, 
      role, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
