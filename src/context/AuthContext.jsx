import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Profile loading error:",
          error
        );

        setProfile(null);
        return;
      }

      /*
       * Existing profile
       */
      if (data) {
        setProfile(data);
        return;
      }

      /*
       * Profile does not exist.
       * Create customer profile.
       */
      const fullName =
        currentUser.user_metadata?.full_name ||
        "";

      const {
        data: createdProfile,
        error: createError,
      } = await supabase
        .from("profiles")
        .insert({
          id: currentUser.id,
          full_name: fullName,
          role: "customer",
        })
        .select()
        .single();

      if (createError) {
        console.error(
          "Profile creation error:",
          createError
        );

        setProfile(null);
        return;
      }

      setProfile(createdProfile);
    } catch (error) {
      console.error(
        "loadProfile error:",
        error
      );

      setProfile(null);
    }
  }

  /*
   * Initialize authentication
   */
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session loading error:",
            error
          );
        }

        if (!mounted) return;

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Auth initialization error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    /*
     * Listen for authentication changes
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * SIGN UP
   */
  async function signUp({
    email,
    password,
    fullName,
  }) {
    const cleanEmail =
      email.trim().toLowerCase();

    const cleanFullName =
      fullName.trim();

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanFullName,
        },
        emailRedirectTo:
          `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(
        "Signup error:",
        error
      );

      throw error;
    }

    return data;
  }

  /*
   * SIGN IN
   */
  async function signIn({
    email,
    password,
  }) {
    const cleanEmail =
      email.trim().toLowerCase();

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error(
        "Signin error:",
        error
      );

      throw error;
    }

    return data;
  }

  /*
   * SIGN OUT
   */
  async function signOut() {
    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Signout error:",
        error
      );

      throw error;
    }

    setUser(null);
    setProfile(null);
  }

  /*
   * ADMIN CHECK
   *
   * Primary source:
   * public.profiles.role
   *
   * Metadata is only a fallback.
   */
  const isAdmin =
    profile?.role === "admin" ||
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  const value = {
    user,
    profile,
    loading,

    isAuthenticated:
      Boolean(user),

    isAdmin,

    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
 * IMPORTANT:
 * AdminRoute uses this named export.
 */
export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}