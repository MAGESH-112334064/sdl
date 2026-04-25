import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { ClipboardList } from "lucide-react";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-32">
        <ClipboardList className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Please login to view orders</p>
        <Button onClick={() => navigate("/auth")}>Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 pt-6">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 pt-16">
          <ClipboardList className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet</p>
          <Button onClick={() => navigate("/menu")}>Order Now</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/order-tracking/${order.id}`)}
              className="w-full rounded-lg border border-border bg-card p-4 text-left transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-accent">{order.token_no}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                <span className="font-semibold text-foreground">₹{order.total}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
