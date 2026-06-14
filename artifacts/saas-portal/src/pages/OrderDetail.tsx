import { useParams, useLocation } from "wouter";
import { useGetPortalOrder, getGetPortalOrderQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, Package, Calendar, Building2 } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  confirmed: "default",
  processing: "secondary",
  fulfilled: "secondary",
  pending: "outline",
  cancelled: "destructive",
};

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();

  const { data: order, isLoading } = useGetPortalOrder(id, {
    query: { enabled: !!id, queryKey: getGetPortalOrderQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="link" onClick={() => setLocation("/orders")}>Back to orders</Button>
      </div>
    );
  }

  const isConfirmation = order.status === "confirmed";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <button
        onClick={() => setLocation("/orders")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="button-back-to-orders"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </button>

      {isConfirmation && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm">Order confirmed</p>
            <p className="text-xs text-muted-foreground">We'll reach out to {order.billing.email} with next steps.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-order-number">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">Placed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className="text-sm px-3 py-1" data-testid="badge-status">
          {order.status}
        </Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">Items</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} data-testid={`order-item-${i}`}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{item.tierName}</Badge>
                      <span className="text-xs text-muted-foreground">{item.seats} seats</span>
                      <Badge variant="outline" className="text-xs">{item.billingCycle}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">${item.unitPrice}/seat/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${item.total.toFixed(2)}<span className="text-muted-foreground font-normal text-xs">/mo</span></p>
                  </div>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm">${Number(order.subtotal).toFixed(2)}/mo</span>
            </div>
            {order.discount != null && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Discount</span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold" data-testid="text-total">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}/mo</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold">Billing Info</h2>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-1 text-sm">
              <p className="font-medium">{order.billing.companyName}</p>
              <p className="text-muted-foreground">{order.billing.contactName}</p>
              <p className="text-muted-foreground">{order.billing.email}</p>
              {order.billing.phone && <p className="text-muted-foreground">{order.billing.phone}</p>}
              {(order.billing.address || order.billing.city || order.billing.country) && (
                <p className="text-muted-foreground">
                  {[order.billing.address, order.billing.city, order.billing.country].filter(Boolean).join(", ")}
                </p>
              )}
              {order.billing.vatNumber && <p className="text-muted-foreground">VAT: {order.billing.vatNumber}</p>}
            </CardContent>
          </Card>

          {order.estimatedDelivery && (
            <Card>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold">Delivery</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="text-muted-foreground">Estimated activation</p>
                <p className="font-medium mt-1" data-testid="text-estimated-delivery">
                  {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Access credentials will be emailed to your registered address.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={() => setLocation("/orders")} variant="outline" data-testid="button-view-all-orders">
            All Orders
          </Button>
          <Button onClick={() => setLocation("/")} data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
