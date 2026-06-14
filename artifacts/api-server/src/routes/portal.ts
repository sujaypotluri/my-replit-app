import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, portalProductsTable, portalLicenseTiersTable, portalPricingPlansTable, portalOrdersTable } from "@workspace/db";
import {
  GetPortalProductsQueryParams,
  GetPortalProductParams,
  GetPortalOrdersQueryParams,
  GetPortalOrderParams,
  CreatePortalOrderBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/portal/products", async (req, res): Promise<void> => {
  const query = GetPortalProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let products = await db
    .select()
    .from(portalProductsTable)
    .orderBy(asc(portalProductsTable.id));

  if (query.data.category) {
    products = products.filter((p) => p.category === query.data.category);
  }

  const tiers = await db
    .select()
    .from(portalLicenseTiersTable)
    .orderBy(asc(portalLicenseTiersTable.sortOrder));

  const result = products.map((p) => ({
    ...p,
    tiers: tiers
      .filter((t) => t.productId === p.id)
      .map((t) => ({
        ...t,
        pricePerSeat: Number(t.pricePerSeat),
        discount: t.discount != null ? Number(t.discount) : null,
      })),
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/portal/products/:id", async (req, res): Promise<void> => {
  const params = GetPortalProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(portalProductsTable)
    .where(eq(portalProductsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const tiers = await db
    .select()
    .from(portalLicenseTiersTable)
    .where(eq(portalLicenseTiersTable.productId, product.id))
    .orderBy(asc(portalLicenseTiersTable.sortOrder));

  res.json({
    ...product,
    tiers: tiers.map((t) => ({
      ...t,
      pricePerSeat: Number(t.pricePerSeat),
      discount: t.discount != null ? Number(t.discount) : null,
    })),
    createdAt: product.createdAt.toISOString(),
  });
});

router.get("/portal/plans", async (_req, res): Promise<void> => {
  const plans = await db
    .select()
    .from(portalPricingPlansTable)
    .orderBy(asc(portalPricingPlansTable.sortOrder));

  res.json(
    plans.map((p) => ({
      ...p,
      monthlyPrice: Number(p.monthlyPrice),
      annualPrice: Number(p.annualPrice),
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

router.get("/portal/orders", async (req, res): Promise<void> => {
  const query = GetPortalOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let orders = await db
    .select()
    .from(portalOrdersTable)
    .orderBy(asc(portalOrdersTable.id));

  if (query.data.status) {
    orders = orders.filter((o) => o.status === query.data.status);
  }

  res.json(orders.map(serializeOrder));
});

router.post("/portal/orders", async (req, res): Promise<void> => {
  const parsed = CreatePortalOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, billing, notes } = parsed.data;

  const tiers = await db.select().from(portalLicenseTiersTable);
  const products = await db.select().from(portalProductsTable);

  const orderItems = items.map((item) => {
    const tier = tiers.find((t) => t.id === item.tierId);
    const product = products.find((p) => p.id === item.productId);
    if (!tier || !product) throw new Error(`Invalid product/tier: ${item.productId}/${item.tierId}`);
    const pricePerSeat = Number(tier.pricePerSeat);
    const total = pricePerSeat * item.seats;
    return {
      productId: item.productId,
      productName: product.name,
      tierId: item.tierId,
      tierName: tier.name,
      seats: item.seats,
      unitPrice: pricePerSeat,
      billingCycle: item.billingCycle ?? "monthly",
      total,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);
  const discount = null;
  const total = subtotal;

  const orderNumber = `NL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const estimatedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [order] = await db
    .insert(portalOrdersTable)
    .values({
      orderNumber,
      status: "confirmed",
      items: orderItems,
      billingCompanyName: billing.companyName,
      billingContactName: billing.contactName,
      billingEmail: billing.email,
      billingPhone: billing.phone ?? null,
      billingAddress: billing.address ?? null,
      billingCity: billing.city ?? null,
      billingCountry: billing.country ?? null,
      billingVatNumber: billing.vatNumber ?? null,
      subtotal: subtotal.toFixed(2),
      discount: discount != null ? String(discount) : null,
      total: total.toFixed(2),
      notes: notes ?? null,
      estimatedDelivery,
    })
    .returning();

  res.status(201).json(serializeOrder(order));
});

router.get("/portal/orders/:id", async (req, res): Promise<void> => {
  const params = GetPortalOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(portalOrdersTable)
    .where(eq(portalOrdersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

function serializeOrder(o: typeof portalOrdersTable.$inferSelect) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    items: o.items,
    billing: {
      companyName: o.billingCompanyName,
      contactName: o.billingContactName,
      email: o.billingEmail,
      phone: o.billingPhone ?? null,
      address: o.billingAddress ?? null,
      city: o.billingCity ?? null,
      country: o.billingCountry ?? null,
      vatNumber: o.billingVatNumber ?? null,
    },
    subtotal: Number(o.subtotal),
    discount: o.discount != null ? Number(o.discount) : null,
    total: Number(o.total),
    notes: o.notes ?? null,
    estimatedDelivery: o.estimatedDelivery ?? null,
    createdAt: o.createdAt.toISOString(),
  };
}

export default router;
