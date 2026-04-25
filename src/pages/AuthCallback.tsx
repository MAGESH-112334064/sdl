import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          setError("Login failed. Please try again.");
          return;
        }

        const user = session.user;

        // Upsert profile
        const profileData: any = {
          user_id: user.id,
          email: user.email || null,
          phone: user.phone || null,
          updated_at: new Date().toISOString(),
        };

        // Get name from user metadata
        const metaName = user.user_metadata?.name || user.user_metadata?.full_name || null;
        if (metaName) profileData.name = metaName;

        await supabase.from("profiles").upsert(profileData, { onConflict: "user_id" });

        // Check role
        const { data: isAdmin } = await supabase.rpc("has_role", { 
          _user_id: user.id, 
          _role: "admin" as any 
        });

        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive font-semibold">{error}</p>
        <Button onClick={() => navigate("/auth")}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Skeleton className="h-8 w-48" />
      <p className="text-sm text-muted-foreground">Logging you in...</p>
    </div>
  );
};

export default AuthCallback;
