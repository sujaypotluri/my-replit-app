import { useState } from "react";
import { Link } from "wouter";
import { useGetPortalPlans } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";

export default function Plans() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const { data: plans, isLoading } = useGetPortalPlans();

  const sortedPlans = plans ? [...plans].sort((a, b) => a.id - b.id) : [];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the plan that scales with your team. Upgrade or downgrade anytime.
          </p>
          <div className="inline-flex items-center border rounded-lg p-1 mt-6 bg-muted/40" data-testid="billing-toggle">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${billing === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="billing-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${billing === "annual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="billing-annual"
            >
              Annual
              <Badge variant="secondary" className="text-xs py-0">Save ~17%</Badge>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-2/3 mt-3" /></CardHeader>
                <CardContent><div className="space-y-2">{[...Array(5)].map((__, j) => <Skeleton key={j} className="h-4 w-full" />)}</div></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedPlans.map((plan) => {
              const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
              const isHighlighted = plan.highlighted;
              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col relative ${isHighlighted ? "border-primary ring-2 ring-primary" : "border"}`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="shadow-sm">{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.tagline && <p className="text-sm text-muted-foreground">{plan.tagline}</p>}
                    <div className="mt-3">
                      <span className="text-4xl font-bold">${Number(price).toFixed(0)}</span>
                      <span className="text-muted-foreground text-sm ml-1">/{billing === "annual" ? "mo, billed annually" : "mo"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.seatsIncluded} seats included{plan.maxSeats ? `, up to ${plan.maxSeats}` : ", unlimited"}</p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <Link href="/" className="w-full">
                      <Button
                        className="w-full"
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

        <p className="text-center text-sm text-muted-foreground mt-10">
          Need a custom quote?{" "}
          <a href="mailto:sales@neurallaunch.io" className="text-primary underline underline-offset-2">Contact our sales team</a>
        </p>
      </div>
    </div>
  );
}
