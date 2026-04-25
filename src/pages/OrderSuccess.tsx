import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-20">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>;

  const pickupTime = order.pickup_slot
    ? new Date(order.pickup_slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "N/A";

  return (
    <div className="animate-slide-up flex flex-col items-center gap-6 px-4 pt-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-canteen-success/10">
        <CheckCircle className="h-12 w-12 text-canteen-success" />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Order Placed! 🎉</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your food is being prepared</p>
      </div>

      {/* Token */}
      <div className="rounded-lg border-2 border-accent bg-accent/5 px-8 py-4">
        <p className="text-xs text-muted-foreground">Your Token Number</p>
        <p className="text-4xl font-extrabold text-accent">{order.token_no}</p>
      </div>

      {/* QR Code */}
      <div className="rounded-lg border border-border bg-card p-4">
        <QRCodeSVG
          value={order.qr_code_data || order.id}
          size={160}
          level="H"
        />
        <p className="mt-2 text-xs text-muted-foreground">Show this at the counter</p>
      </div>

      {/* Details */}
      <div className="w-full space-y-2 rounded-lg border border-border bg-card p-4 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono text-xs">{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pickup Time</span>
          <span className="font-semibold">{pickupTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">₹{order.total}</span>
        </div>
      </div>

      <div className="flex w-full gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/order-tracking/${order.id}`)}>
          Track Order <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button className="flex-1" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
