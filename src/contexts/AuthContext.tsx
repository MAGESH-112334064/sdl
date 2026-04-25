import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const upsertProfile = async (user: User) => {
  const profileData: any = {
    user_id: user.id,
    email: user.email || null,
    phone: user.phone || null,
    updated_at: new Date().toISOString(),
  };
  const metaName = user.user_metadata?.name || user.user_metadata?.full_name;
  if (metaName) profileData.name = metaName;

  await supabase.from("profiles").upsert(profileData, { onConflict: "user_id" });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUser = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Upsert profile (fire-and-forget, don't block auth)
      upsertProfile(session.user).catch(() => {});

      // Check admin role
      setTimeout(() => {
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" as any })
          .then(({ data }) => setIsAdmin(!!data));
      }, 0);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
