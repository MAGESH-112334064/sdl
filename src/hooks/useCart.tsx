import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({
      productId,
      addonIds = [],
      qty = 1,
      lineTotal,
    }: {
      productId: string;
      addonIds?: string[];
      qty?: number;
      lineTotal: number;
    }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        addon_ids: addonIds,
        qty,
        line_total: lineTotal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const updateCartItem = useMutation({
    mutationFn: async ({ id, qty, lineTotal }: { id: string; qty: number; lineTotal: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ qty, line_total: lineTotal })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeCartItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartTotal = cartItems.reduce((sum: number, item: any) => sum + Number(item.line_total), 0);
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + item.qty, 0);

  return {
    cartItems,
    isLoading,
    cartCount,
    cartTotal,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };
};
