import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePortalOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

const billingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
});

type BillingForm = z.infer<typeof billingSchema>;

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreatePortalOrder();

  const form = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      vatNumber: "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button className="neon-glow" onClick={() => setLocation("/")} data-testid="button-browse">Browse Catalog</Button>
      </div>
    );
  }

  function onSubmit(data: BillingForm) {
    createOrder.mutate(
      {
        data: {
          items: items.map((item) => ({
            productId: item.productId,
            tierId: item.tierId,
            seats: item.seats,
            billingCycle: item.billingCycle,
          })),
          billing: {
            companyName: data.companyName,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone ?? null,
            address: data.address ?? null,
            city: data.city ?? null,
            country: data.country ?? null,
            vatNumber: data.vatNumber ?? null,
          },
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <button
        onClick={() => setLocation("/cart")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="button-back-to-cart"
      >
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </button>

      <h1 className="text-2xl font-bold mb-7">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="neon-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <h2 className="font-semibold">Billing Information</h2>
            </CardHeader>
            <CardContent className="pt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-checkout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl><Input placeholder="Acme Corp" data-testid="input-company-name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl><Input placeholder="Jane Smith" data-testid="input-contact-name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl><Input type="email" placeholder="jane@acme.com" data-testid="input-email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl><Input placeholder="+1 (555) 000-0000" data-testid="input-phone" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl><Input placeholder="United States" data-testid="input-country" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl><Input placeholder="123 Main St" data-testid="input-address" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="San Francisco" data-testid="input-city" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number</FormLabel>
                        <FormControl><Input placeholder="EU123456789" data-testid="input-vat" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="pt-3">
                    <Button
                      type="submit"
                      className="w-full neon-glow"
                      disabled={createOrder.isPending}
                      data-testid="button-place-order"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {createOrder.isPending ? "Processing..." : "Place Order"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      By placing your order you agree to our Terms of Service
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 neon-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <h3 className="font-semibold">Order Summary</h3>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.tierId}`} className="flex justify-between text-sm gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{item.tierName}</Badge>
                      <span className="text-xs text-muted-foreground">{item.seats} seats</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-medium">${(item.pricePerSeat * item.seats).toFixed(2)}/mo</span>
                </div>
              ))}
              <Separator className="bg-border/60" />
              <div className="flex justify-between font-semibold">
                <span>Total / month</span>
                <span className="neon-text" data-testid="text-order-total">${cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
