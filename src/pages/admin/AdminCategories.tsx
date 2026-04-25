import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminCategories = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("categories").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Updated");
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-2xl font-extrabold text-foreground">Categories</h1>
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
        ) : (
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />}
                </div>
                <span className="flex-1 text-sm font-semibold">{cat.name}</span>
                <Switch
                  checked={cat.active}
                  onCheckedChange={(v) => toggleActive.mutate({ id: cat.id, active: v })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
