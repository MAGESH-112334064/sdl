import { Star, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VegBadge from "./VegBadge";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  rating: number;
  in_stock: boolean;
  description?: string | null;
};

const ProductCard = ({ id, name, price, image_url, is_veg, rating, in_stock }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/item/${id}`)}
      disabled={!in_stock}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        !in_stock && "opacity-60"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        {!in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center gap-1.5">
          <VegBadge isVeg={is_veg} />
          <h3 className="truncate text-sm font-semibold text-foreground text-left">{name}</h3>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">₹{price}</span>
          <div className="flex items-center gap-1 text-xs text-accent">
            <Star className="h-3 w-3 fill-accent" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
      </div>
      {in_stock && (
        <div className="absolute bottom-12 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
          <Plus className="h-4 w-4" />
        </div>
      )}
    </button>
  );
};

export default ProductCard;
