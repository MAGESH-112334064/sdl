import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { CheckCircle, Clock, ChefHat, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const steps = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Package },
  { key: "picked_up", label: "Picked Up", icon: Clock },
];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>;

  const currentIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="animate-slide-up space-y-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Order Status</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-1 text-sm text-muted-foreground">Token</p>
        <p className="text-3xl font-extrabold text-accent">{order.token_no}</p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-8 w-0.5", isCompleted ? "bg-accent" : "bg-border")} />
                )}
              </div>
              <div className="pb-8">
                <p className={cn("text-sm font-semibold", isCurrent ? "text-accent" : isCompleted ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                {isCurrent && <p className="text-xs text-muted-foreground">In progress...</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;
