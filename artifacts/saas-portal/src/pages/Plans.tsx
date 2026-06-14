import { useState } from "react";
import { Link } from "wouter";
import { useGetPortalPlans } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Zap } from "lucide-react";

export default function Plans() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const { data: plans, isLoading } = useGetPortalPlans();

  const sortedPlans = plans ? [...plans].sort((a, b) => a.id - b.id) : [];

  return (
    <div className="py-14 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 mb-5 bg-primary/5 text-primary text-sm font-medium neon-border">
            <Zap className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Simple, <span className="neon-text">transparent</span> pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Choose the plan that scales with your team. Upgrade or downgrade anytime.
          </p>
          <div
            className="inline-flex items-center border border-border/60 rounded-lg p-1 mt-6 bg-card"
            data-testid="billing-toggle"
          >
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground neon-glow" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="billing-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${billing === "annual" ? "bg-primary text-primary-foreground neon-glow" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="billing-annual"
            >
              Annual
              <Badge variant="secondary" className="text-xs py-0 bg-accent/20 text-accent-foreground border-0">Save ~17%</Badge>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col neon-card">
                <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-2/3 mt-3" /></CardHeader>
                <CardContent><div className="space-y-2">{[...Array(5)].map((__, j) => <Skeleton key={j} className="h-4 w-full" />)}</div></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {sortedPlans.map((plan) => {
              const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
              const isHighlighted = plan.highlighted;
              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col relative transition-all ${isHighlighted ? "neon-border neon-card scale-105" : "neon-card hover:border-primary/40"}`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="shadow-sm neon-glow px-3">{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-5 pt-6">
                    <h3 className={`text-xl font-bold ${isHighlighted ? "neon-text" : ""}`}>{plan.name}</h3>
                    {plan.tagline && <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>}
                    <div className="mt-4 flex items-end gap-1">
                      <span className={`text-5xl font-bold ${isHighlighted ? "neon-text" : ""}`}>${Number(price).toFixed(0)}</span>
                      <span className="text-muted-foreground text-sm mb-1.5">/{billing === "annual" ? "mo, billed annually" : "mo"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 border border-border/60 rounded-md px-2 py-1 bg-muted/30 w-fit">
                      {plan.seatsIncluded} seats included{plan.maxSeats ? `, up to ${plan.maxSeats}` : ", unlimited"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 pb-5">
                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isHighlighted ? "text-primary" : "text-primary"}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/60">
                    <Link href="/" className="w-full">
                      <Button
                        className={`w-full ${isHighlighted ? "neon-glow" : "border-primary/40 hover:border-primary hover:neon-glow"}`}
                        variant={isHighlighted ? "default" : "outline"}
                        data-testid={`button-select-plan-${plan.id}`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-12">
          Need a custom quote?{" "}
          <a href="mailto:sales@neurallaunch.io" className="neon-text underline underline-offset-2">Contact our sales team</a>
        </p>
      </div>
    </div>
  );
}
