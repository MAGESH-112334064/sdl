import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, LogOut, Shield } from "lucide-react";

const Profile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-32">
        <User className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Please login</p>
        <Button onClick={() => navigate("/auth")}>Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-6">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="animate-slide-up space-y-6 px-4 pt-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
          {(profile?.name?.[0] || user.email?.[0] || "U").toUpperCase()}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-foreground">{profile?.name || "User"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email || user.email}</p>
          {profile?.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        {isAdmin && (
          <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" /> Admin Panel
          </Button>
        )}
        <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
