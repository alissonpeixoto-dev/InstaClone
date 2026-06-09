import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseAuthError(error: AuthError | Error | unknown): string {
  if (!error) return "Erro desconhecido.";
  const message =
    error instanceof Error ? error.message : String(error);

  if (message.includes("User already registered") || message.includes("already been registered"))
    return "Este email já está cadastrado. Tente fazer login.";
  if (message.includes("Invalid login credentials"))
    return "Email ou senha incorretos.";
  if (message.includes("Email not confirmed"))
    return "Confirme seu email antes de fazer login.";
  if (message.includes("Password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Token has expired") || message.includes("token is expired"))
    return "O link expirou. Solicite um novo.";
  if (message.includes("Invalid token") || message.includes("invalid token"))
    return "Link inválido. Solicite um novo.";
  if (message.includes("User not found"))
    return "Usuário não encontrado.";
  if (message.includes("Network") || message.includes("fetch"))
    return "Falha de conexão. Verifique sua internet.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Muitas tentativas. Aguarde alguns minutos.";
  if (message.includes("signup_disabled"))
    return "Cadastro desabilitado. Contate o administrador.";

  return message || "Ocorreu um erro. Tente novamente.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      setProfile(data ?? null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (s?.user) fetchProfile(s.user.id);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      } else if (event === "PASSWORD_RECOVERY") {
        // Handled by router
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase().trim())
        .single();

      if (existingUser) {
        return { error: "Este nome de usuário já está em uso." };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            full_name: fullName.trim(),
          },
        },
      });

      if (error) return { error: parseAuthError(error) };

      // Create profile immediately (trigger will handle it, but fallback here)
      if (data.user) {
        const profileData = {
          id: data.user.id,
          username: username.toLowerCase().trim(),
          full_name: fullName.trim(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabase.from("profiles") as any).upsert(profileData);

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: parseAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) return { error: parseAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { error: parseAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        profileLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
