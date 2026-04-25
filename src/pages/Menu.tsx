import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/shared/ProductCard";
import { cn } from "@/lib/utils";

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("active", true).order("name");
      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="animate-slide-up space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">Menu</h1>

      {/* Category pills */}
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            !selectedCategory ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-foreground"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: cat.id })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              selectedCategory === cat.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No products found</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
