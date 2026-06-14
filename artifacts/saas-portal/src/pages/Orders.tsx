import { Link } from "wouter";
import { useGetPortalOrders } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  confirmed: "default",
  processing: "secondary",
  fulfilled: "secondary",
  pending: "outline",
  cancelled: "destructive",
};

export default function Orders() {
  const { data: orders, isLoading } = useGetPortalOrders();

  const sorted = orders ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <Link href="/">
          <Button variant="outline" size="sm" data-testid="button-browse-catalog">Browse Catalog</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Your order history will appear here after you place your first order.</p>
          <Link href="/">
            <Button data-testid="button-start-shopping">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
            <Card key={order.id} className="hover:shadow-sm transition-shadow" data-testid={`card-order-${order.id}`}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm" data-testid={`text-order-number-${order.id}`}>{order.orderNumber}</span>
                    <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className="text-xs">{order.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span data-testid={`text-order-total-${order.id}`}>${Number(order.total).toFixed(2)}/mo</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{order.billing.companyName}</p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="ghost" size="sm" data-testid={`button-view-order-${order.id}`}>
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
