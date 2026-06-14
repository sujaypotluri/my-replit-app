import { useState } from "react";
import { Link } from "wouter";
import { useGetPortalProducts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Shield, BarChart2, Layers } from "lucide-react";

type Category = "all" | "platform" | "addon" | "support";

const CATEGORY_LABELS: Record<string, string> = {
  platform: "Platform",
  addon: "Add-On",
  support: "Support",
};

export default function Home() {
  const [category, setCategory] = useState<Category>("all");

  const { data: allProducts, isLoading } = useGetPortalProducts(
    category === "all" ? {} : { category: category as "platform" | "addon" | "support" }
  );

  const categories: Category[] = ["all", "platform", "addon", "support"];

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">Enterprise AI Marketing Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Scale your marketing with<br />AI-powered precision
          </h1>
          <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            Give your teams the tools they need to run high-impact campaigns at scale. Choose the plan that fits your organization.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/plans">
              <Button variant="secondary" size="lg" data-testid="button-view-pricing">
                View Pricing Plans <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>SOC 2 Type II Certified</span></div>
            <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" /><span>99.9% Uptime SLA</span></div>
            <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /><span>API-First Platform</span></div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /><span>Dedicated Onboarding</span></div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <p className="text-muted-foreground text-sm mt-1">Everything your team needs to succeed</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap" data-testid="category-filter">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  data-testid={`filter-${cat}`}
                >
                  {cat === "all" ? "All Products" : CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="flex flex-col">
                  <CardHeader className="pb-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full mt-2" /></CardHeader>
                  <CardContent className="flex-1"><Skeleton className="h-16 w-full" /></CardContent>
                  <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
                </Card>
              ))}
            </div>
          ) : allProducts && allProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map((product) => {
                const startingPrice = product.tiers.length > 0
                  ? Math.min(...product.tiers.map((t) => t.pricePerSeat))
                  : null;
                return (
                  <Card
                    key={product.id}
                    className="flex flex-col hover:shadow-md transition-shadow border"
                    data-testid={`card-product-${product.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[product.category] ?? product.category}</Badge>
                            {product.badge && <Badge variant="default" className="text-xs">{product.badge}</Badge>}
                          </div>
                          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
                        </div>
                        {product.popular && (
                          <Badge className="shrink-0">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      {product.highlights && product.highlights.length > 0 && (
                        <ul className="space-y-1">
                          {product.highlights.slice(0, 3).map((h, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>{h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-3 border-t">
                      {startingPrice != null ? (
                        <span className="text-sm text-muted-foreground">
                          From <span className="text-foreground font-semibold">${startingPrice}</span>/seat/mo
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Contact sales</span>
                      )}
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="outline" data-testid={`button-view-product-${product.id}`}>
                          View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No products found{category !== "all" ? ` in "${CATEGORY_LABELS[category]}"` : ""}.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
