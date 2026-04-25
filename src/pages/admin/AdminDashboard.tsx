import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Package, Settings, ClipboardList, ArrowLeft } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: orders, error } = await supabase
        .from("orders")
        .select("status")
        .gte("created_at", today);
      if (error) throw error;

      return {
        total: orders?.length ?? 0,
        confirmed: orders?.filter((o) => o.status === "confirmed").length ?? 0,
        preparing: orders?.filter((o) => o.status === "preparing").length ?? 0,
        ready: orders?.filter((o) => o.status === "ready").length ?? 0,
        picked_up: orders?.filter((o) => o.status === "picked_up").length ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total Orders", value: stats?.total, color: "bg-primary text-primary-foreground" },
    { label: "Confirmed", value: stats?.confirmed, color: "bg-blue-100 text-blue-700" },
    { label: "Preparing", value: stats?.preparing, color: "bg-amber-100 text-amber-700" },
    { label: "Ready", value: stats?.ready, color: "bg-green-100 text-green-700" },
  ];

  const menuItems = [
    { icon: ClipboardList, label: "Order Management", path: "/admin/orders" },
    { icon: LayoutGrid, label: "Manage Categories", path: "/admin/categories" },
    { icon: Package, label: "Manage Products", path: "/admin/products" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            : cards.map((card) => (
                <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
                  <p className="text-xs font-medium opacity-80">{card.label}</p>
                  <p className="text-3xl font-extrabold">{card.value}</p>
                </div>
              ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <Button key={path} variant="outline" className="w-full justify-start" onClick={() => navigate(path)}>
              <Icon className="mr-2 h-4 w-4" /> {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
