import { Link } from "wouter";
import { useGetPortalOrders } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary/15 text-primary border border-primary/30",
  processing: "bg-accent/15 text-accent-foreground border border-accent/30",
  fulfilled: "bg-chart-4/15 text-foreground border border-chart-4/30",
  pending: "bg-muted text-muted-foreground border border-border",
  cancelled: "bg-destructive/15 text-destructive border border-destructive/30",
};

export default function Orders() {
  const { data: orders, isLoading } = useGetPortalOrders();

  const sorted = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Order History</h1>
        <Link href="/">
          <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:neon-glow transition-all" data-testid="button-browse-catalog">
            Browse Catalog
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-5 neon-glow">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-7">Your order history will appear here after you place your first order.</p>
          <Link href="/">
            <Button className="neon-glow" data-testid="button-start-shopping">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
            <Card
              key={order.id}
              className="neon-card hover:border-primary/40 transition-all"
              data-testid={`card-order-${order.id}`}
            >
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-sm neon-text" data-testid={`text-order-number-${order.id}`}>
                      {order.orderNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    <span className="text-border">•</span>
                    <span data-testid={`text-order-total-${order.id}`}>${Number(order.total).toFixed(2)}/mo</span>
                    <span className="text-border">•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{order.billing.companyName}</p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:neon-glow shrink-0 transition-all" data-testid={`button-view-order-${order.id}`}>
                    View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
