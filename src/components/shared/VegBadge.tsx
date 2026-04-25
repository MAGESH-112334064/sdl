import { cn } from "@/lib/utils";

const VegBadge = ({ isVeg }: { isVeg: boolean }) => (
  <span
    className={cn(
      "inline-flex h-4 w-4 items-center justify-center rounded-sm border",
      isVeg ? "border-canteen-veg" : "border-canteen-nonveg"
    )}
  >
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        isVeg ? "bg-canteen-veg" : "bg-canteen-nonveg"
      )}
    />
  </span>
);

export default VegBadge;
