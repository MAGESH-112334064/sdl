import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, isLoading, cartTotal, updateCartItem, removeCartItem } = useCart();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-32">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Please login to view your cart</p>
        <Button onClick={() => navigate("/auth")}>Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-32">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Add some delicious items!</p>
        <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
      </div>
    );
  }

  const tax = cartTotal * 0.05;
  const grandTotal = cartTotal + tax;

  return (
    <div className="animate-slide-up space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">Your Cart</h1>

      <div className="space-y-3">
        {cartItems.map((item: any) => {
          const product = item.products;
          return (
            <div key={item.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {product?.image_url && (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{product?.name}</h3>
                  <p className="text-xs text-muted-foreground">₹{item.line_total}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                    <button
                      onClick={() => {
                        if (item.qty <= 1) {
                          removeCartItem.mutate(item.id);
                        } else {
                          const newQty = item.qty - 1;
                          const priceEach = Number(item.line_total) / item.qty;
                          updateCartItem.mutate({ id: item.id, qty: newQty, lineTotal: priceEach * newQty });
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-bold">{item.qty}</span>
                    <button
                      onClick={() => {
                        const newQty = item.qty + 1;
                        const priceEach = Number(item.line_total) / item.qty;
                        updateCartItem.mutate({ id: item.id, qty: newQty, lineTotal: priceEach * newQty });
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeCartItem.mutate(item.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (5%)</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
        Proceed to Checkout — ₹{grandTotal.toFixed(0)}
      </Button>
    </div>
  );
};

export default Cart;
