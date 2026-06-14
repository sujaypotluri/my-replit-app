import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, List, Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const isCurrent = (path: string) => location === path;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md neon-glow">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight neon-text">NeuralLaunch</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${isCurrent("/") ? "neon-text" : "text-muted-foreground hover:text-foreground"}`}
              >
                Catalog
              </Link>
              <Link
                href="/plans"
                className={`text-sm font-medium transition-colors ${isCurrent("/plans") ? "neon-text" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/orders" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <List className="w-4 h-4" />
              Orders
            </Link>

            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative border-primary/40 hover:border-primary hover:neon-glow transition-all" data-testid="button-cart">
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full neon-glow">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              data-testid="button-toggle-theme"
              className="w-8 h-8 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative neon-scan">
        {children}
      </main>

      <footer className="border-t border-border/60 py-10 bg-card/40">
        <div className="container mx-auto px-4 md:px-8 text-center text-muted-foreground text-sm">
          <p className="mb-1">
            <span className="neon-text font-semibold">NeuralLaunch</span> — Enterprise AI Marketing Platform
          </p>
          <p>© {new Date().getFullYear()} NeuralLaunch Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
