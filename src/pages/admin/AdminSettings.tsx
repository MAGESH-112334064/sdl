import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AdminSettings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    breakfast_cutoff: "",
    lunch_cutoff: "",
    snacks_cutoff: "",
    dinner_cutoff: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        breakfast_cutoff: settings.breakfast_cutoff,
        lunch_cutoff: settings.lunch_cutoff,
        snacks_cutoff: settings.snacks_cutoff,
        dinner_cutoff: settings.dinner_cutoff,
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      if (!settings) return;
      const { error } = await supabase.from("settings").update(form).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  if (isLoading) return <div className="p-4"><Skeleton className="h-64 rounded-lg" /></div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h3 className="font-bold text-foreground">Cutoff Times</h3>
          {(["breakfast_cutoff", "lunch_cutoff", "snacks_cutoff", "dinner_cutoff"] as const).map((key) => (
            <div key={key} className="space-y-1">
              <Label className="capitalize">{key.replace("_cutoff", "")} Cutoff</Label>
              <Input
                type="time"
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
