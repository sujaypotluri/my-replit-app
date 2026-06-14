import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Package, List, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();
  const [location] = useLocation();

  const isCurrent = (path: string) => location === path;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Box className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">NeuralLaunch</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${isCurrent("/") ? "text-primary" : "text-muted-foreground"}`}>
                Catalog
              </Link>
              <Link href="/plans" className={`text-sm font-medium transition-colors hover:text-primary ${isCurrent("/plans") ? "text-primary" : "text-muted-foreground"}`}>
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-2">
              <List className="w-4 h-4" />
              Orders
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="border-t py-12 bg-muted/40">
        <div className="container mx-auto px-4 md:px-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} NeuralLaunch Inc. Enterprise AI Marketing Platform.</p>
        </div>
      </footer>
    </div>
  );
}
