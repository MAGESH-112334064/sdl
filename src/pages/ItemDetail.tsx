import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import VegBadge from "@/components/shared/VegBadge";
import { ArrowLeft, Minus, Plus, Star, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: addons = [] } = useQuery({
    queryKey: ["addons", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("addons").select("*").eq("product_id", id!).eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-muted-foreground">Item not found</div>;

  const addonTotal = addons.filter((a) => selectedAddons.includes(a.id)).reduce((s, a) => s + Number(a.price), 0);
  const lineTotal = (Number(product.price) + addonTotal) * qty;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/auth");
      return;
    }
    addToCart.mutate({
      productId: product.id,
      addonIds: selectedAddons,
      qty,
      lineTotal,
    });
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  return (
    <div className="animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <VegBadge isVeg={product.is_veg} />
            <h1 className="text-xl font-extrabold text-foreground">{product.name}</h1>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-accent">{product.rating}</span>
          </div>
          {product.description && (
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          )}
          <p className="mt-2 text-2xl font-extrabold text-foreground">₹{product.price}</p>
        </div>

        {/* Addons */}
        {addons.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground">Add-ons</h3>
            <div className="space-y-2">
              {addons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => toggleAddon(addon.id)}
                    />
                    <span className="text-sm font-medium">{addon.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">+₹{addon.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Qty + Add to Cart */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-muted-foreground">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="text-foreground">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            className="flex-1"
            size="lg"
            onClick={handleAddToCart}
            disabled={!product.in_stock || addToCart.isPending}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add ₹{lineTotal.toFixed(0)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
