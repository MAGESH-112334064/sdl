import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/shared/ProductCard";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: popularProducts = [], isLoading: prodLoading } = useQuery({
    queryKey: ["popular-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("rating", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = search
    ? popularProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : popularProducts;

  return (
    <div className="animate-slide-up space-y-6 px-4 pt-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Good day! 👋</p>
        <h1 className="text-2xl font-extrabold text-foreground">What would you like to eat?</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">Categories</h2>
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {catLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-lg" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/menu?category=${cat.id}`)}
                  className="flex w-20 shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <span className="text-center text-xs font-medium text-foreground leading-tight">{cat.name}</span>
                </button>
              ))}
        </div>
      </section>

      {/* Popular Items */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">Popular Items 🔥</h2>
        {prodLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
