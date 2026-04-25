import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Clock } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [pickupSlot, setPickupSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const slots = (settings?.slots as string[] | undefined) ?? [];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const availableSlots = slots.filter((s: string) => s > currentTime);

  const tax = cartTotal * 0.05;
  const grandTotal = cartTotal + tax;

  const handlePlaceOrder = async () => {
    if (!user) return navigate("/auth");
    if (!pickupSlot) return toast.error("Please select a pickup slot");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    setLoading(true);
    try {
      // Generate token
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);
      const tokenNo = `T-${String((count ?? 0) + 1).padStart(3, "0")}`;

      // Create order
      const pickupDate = new Date();
      const [h, m] = pickupSlot.split(":");
      pickupDate.setHours(parseInt(h), parseInt(m), 0, 0);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: cartTotal,
          tax,
          total: grandTotal,
          pickup_slot: pickupDate.toISOString(),
          token_no: tokenNo,
          qr_code_data: JSON.stringify({ token: tokenNo, total: grandTotal }),
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        addon_ids: item.addon_ids,
        qty: item.qty,
        price_each: Number(item.line_total) / item.qty,
        line_total: Number(item.line_total),
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart.mutateAsync();

      toast.success("Order placed successfully!");
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-6 px-4 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">Checkout</h1>

      {/* Pickup Slot */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4" /> Pickup Time Slot
        </label>
        <Select value={pickupSlot} onValueChange={setPickupSlot}>
          <SelectTrigger>
            <SelectValue placeholder="Select a pickup time" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.length === 0 ? (
              <SelectItem value="none" disabled>No slots available</SelectItem>
            ) : (
              availableSlots.map((slot: string) => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Order Summary */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
        {cartItems.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.products?.name} x{item.qty}</span>
            <span>₹{item.line_total}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
        <CreditCard className="mr-2 h-4 w-4" />
        {loading ? "Placing Order..." : `Pay ₹${grandTotal.toFixed(0)}`}
      </Button>
    </div>
  );
};

export default Checkout;
