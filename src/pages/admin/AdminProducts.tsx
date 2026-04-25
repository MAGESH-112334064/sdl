import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import VegBadge from "@/components/shared/VegBadge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const toggleStock = useMutation({
    mutationFn: async ({ id, in_stock }: { id: string; in_stock: boolean }) => {
      const { error } = await supabase.from("products").update({ in_stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Stock updated");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("products").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Updated");
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h1 className="text-2xl font-extrabold text-foreground">Products</h1>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
        ) : (
          <div className="space-y-2">
            {products.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <VegBadge isVeg={p.is_veg} />
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">₹{p.price} • {(p as any).categories?.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    Stock
                    <Switch checked={p.in_stock} onCheckedChange={(v) => toggleStock.mutate({ id: p.id, in_stock: v })} />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    Active
                    <Switch checked={p.active} onCheckedChange={(v) => toggleActive.mutate({ id: p.id, active: v })} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
