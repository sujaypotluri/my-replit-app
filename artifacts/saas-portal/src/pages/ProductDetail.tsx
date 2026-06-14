import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetPortalProduct, getGetPortalProductQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Check, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { LicenseTier } from "@workspace/api-client-react";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetPortalProduct(id, {
    query: { enabled: !!id, queryKey: getGetPortalProductQueryKey(id) },
  });

  const [selectedTier, setSelectedTier] = useState<LicenseTier | null>(null);
  const [seats, setSeats] = useState(5);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const tier = selectedTier ?? (product?.tiers?.[0] ?? null);
  const minSeats = tier?.minSeats ?? 1;
  const maxSeats = tier?.maxSeats ?? 100;
  const pricePerSeat = tier?.pricePerSeat ?? 0;
  const total = pricePerSeat * seats;

  function handleAddToCart() {
    if (!product || !tier) return;
    addItem({
      productId: product.id,
      productName: product.name,
      tierId: tier.id,
      tierName: tier.name,
      seats,
      pricePerSeat,
      billingCycle,
    });
    toast({ title: "Added to cart", description: `${seats} seats of ${product.name} (${tier.name}) added.` });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-24 w-full" /></div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="link" onClick={() => setLocation("/")}>Back to catalog</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </button>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="secondary" className="capitalize">{product.category}</Badge>
              {product.badge && <Badge className="neon-glow">{product.badge}</Badge>}
              {product.popular && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  <Star className="w-3 h-3 mr-1" />Popular
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tiers && product.tiers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Available Tiers</h3>
              <div className="space-y-3">
                {product.tiers.map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-all ${tier?.id === t.id ? "neon-border neon-card" : "neon-card hover:border-primary/40"}`}
                    onClick={() => { setSelectedTier(t); setSeats(Math.max(t.minSeats, seats)); }}
                    data-testid={`card-tier-${t.id}`}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${tier?.id === t.id ? "border-primary bg-primary neon-glow" : "border-muted-foreground"}`}>
                            {tier?.id === t.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                          </div>
                          <span className="font-medium text-sm">{t.name}</span>
                          {t.recommended && <Badge className="text-xs neon-glow">Recommended</Badge>}
                        </div>
                        <span className={`text-sm font-semibold ${tier?.id === t.id ? "neon-text" : ""}`}>${t.pricePerSeat}/seat/mo</span>
                      </div>
                    </CardHeader>
                    {t.features && t.features.length > 0 && (
                      <CardContent className="py-2 px-4 pt-0">
                        <ul className="flex flex-wrap gap-x-4 gap-y-1">
                          {t.features.map((f, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <Check className="w-3 h-3 text-primary" />{f}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Card className="sticky top-24 neon-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <h3 className="font-semibold">Configure your purchase</h3>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div>
                <label className="text-sm font-medium">Billing cycle</label>
                <div className="flex gap-2 mt-2">
                  {(["monthly", "annual"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setBillingCycle(c)}
                      className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-all ${billingCycle === c ? "border-primary bg-primary/10 text-primary neon-border" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                      data-testid={`billing-${c}`}
                    >
                      {c === "annual" ? "Annual (save 17%)" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Seats</label>
                  <input
                    type="number"
                    min={minSeats}
                    max={maxSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(minSeats, Math.min(maxSeats, parseInt(e.target.value, 10) || minSeats)))}
                    className="w-16 text-right border border-border/60 rounded-md px-2 py-1 text-sm bg-background focus:border-primary focus:outline-none transition-colors"
                    data-testid="input-seats"
                  />
                </div>
                <Slider
                  min={minSeats}
                  max={Math.min(maxSeats, 100)}
                  step={1}
                  value={[seats]}
                  onValueChange={(v) => setSeats(v[0])}
                  data-testid="slider-seats"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Min {minSeats}{maxSeats ? ` · Max ${maxSeats}` : ""} seats</p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{seats} seats × ${pricePerSeat}/mo</span>
                  <span className="neon-text font-semibold">${total.toFixed(2)}/mo</span>
                </div>
                {billingCycle === "annual" && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Billed annually</span>
                    <span>${(total * 12 * 0.83).toFixed(2)}/yr</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full neon-glow"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
                disabled={!tier}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
