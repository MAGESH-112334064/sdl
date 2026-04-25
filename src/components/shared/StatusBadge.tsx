import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparing", className: "bg-amber-100 text-amber-700" },
  ready: { label: "Ready", className: "bg-green-100 text-green-700" },
  picked_up: { label: "Picked Up", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
