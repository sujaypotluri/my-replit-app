import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function Cart() {
  const { items, updateSeats, removeItem, cartTotal } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-5 neon-glow">
          <ShoppingCart className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-7">Browse our catalog and add products to get started.</p>
        <Link href="/">
          <Button className="neon-glow" data-testid="button-browse-catalog">Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-7">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const itemTotal = item.pricePerSeat * item.seats;
            return (
              <Card
                key={`${item.productId}-${item.tierId}`}
                className="neon-card"
                data-testid={`cart-item-${item.productId}-${item.tierId}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{item.productName}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{item.tierName}</Badge>
                        <Badge variant="outline" className="text-xs border-border/60 capitalize">{item.billingCycle}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.tierId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      data-testid={`button-remove-${item.productId}-${item.tierId}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateSeats(item.productId, item.tierId, Math.max(1, item.seats - 1))}
                        className="w-7 h-7 rounded-md border border-border/60 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all"
                        data-testid={`button-decrease-seats-${item.productId}`}
                      ><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium w-14 text-center" data-testid={`seats-count-${item.productId}`}>{item.seats} seats</span>
                      <button
                        onClick={() => updateSeats(item.productId, item.tierId, item.seats + 1)}
                        className="w-7 h-7 rounded-md border border-border/60 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all"
                        data-testid={`button-increase-seats-${item.productId}`}
                      ><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="text-right">
                      <p className="neon-text font-bold">${itemTotal.toFixed(2)}<span className="text-muted-foreground text-xs font-normal">/mo</span></p>
                      <p className="text-xs text-muted-foreground">${item.pricePerSeat}/seat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-24 neon-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <h3 className="font-semibold">Order Summary</h3>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.tierId}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">{item.productName} × {item.seats}</span>
                  <span className="shrink-0">${(item.pricePerSeat * item.seats).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="bg-border/60" />
              <div className="flex justify-between font-semibold">
                <span>Total / month</span>
                <span className="neon-text">${cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/60 pt-4 flex-col gap-3">
              <Button
                className="w-full neon-glow"
                onClick={() => setLocation("/checkout")}
                data-testid="button-proceed-checkout"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-border/60 hover:border-primary/50 transition-all" data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
