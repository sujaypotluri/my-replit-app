import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, clientsTable, licensesTable, seatsTable, usersTable } from "@workspace/db";
import {
  GetClientsResponse,
  GetClientParams,
  GetClientResponse,
  CreateClientBody,
  UpdateClientParams,
  UpdateClientBody,
  UpdateClientResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichClient(clientId: number) {
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, clientId));
  if (!client) return null;

  const [seatStats] = await db
    .select({
      activeSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'active' then 1 end) as int)`,
      inactiveSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'inactive' then 1 end) as int)`,
      totalSeats: sql<number>`cast(count(*) as int)`,
    })
    .from(seatsTable)
    .innerJoin(licensesTable, eq(seatsTable.licenseId, licensesTable.id))
    .where(eq(licensesTable.clientId, clientId));

  const [licenseCount] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(licensesTable)
    .where(eq(licensesTable.clientId, clientId));

  const activeSeats = seatStats?.activeSeats ?? 0;
  const totalSeats = seatStats?.totalSeats ?? 0;
  const utilizationRate = totalSeats > 0 ? Number(((activeSeats / totalSeats) * 100).toFixed(1)) : 0;

  return {
    ...client,
    totalLicenses: licenseCount?.count ?? 0,
    activeSeats,
    inactiveSeats: seatStats?.inactiveSeats ?? 0,
    utilizationRate,
  };
}

router.get("/clients", async (req, res): Promise<void> => {
  const clients = await db.select().from(clientsTable).orderBy(clientsTable.name);

  const enriched = await Promise.all(clients.map((c) => enrichClient(c.id)));
  res.json(GetClientsResponse.parse(enriched.filter(Boolean)));
});

router.post("/clients", async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [client] = await db.insert(clientsTable).values(parsed.data).returning();
  const enriched = await enrichClient(client.id);
  res.status(201).json(GetClientResponse.parse(enriched));
});

router.get("/clients/:id", async (req, res): Promise<void> => {
  const params = GetClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const enriched = await enrichClient(params.data.id);
  if (!enriched) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.json(GetClientResponse.parse(enriched));
});

router.patch("/clients/:id", async (req, res): Promise<void> => {
  const params = UpdateClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof clientsTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.industry !== undefined) updateData.industry = parsed.data.industry;
  if (parsed.data.contactEmail !== undefined) updateData.contactEmail = parsed.data.contactEmail;
  if (parsed.data.status != null) updateData.status = parsed.data.status;

  const [updated] = await db
    .update(clientsTable)
    .set(updateData)
    .where(eq(clientsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const enriched = await enrichClient(updated.id);
  res.json(UpdateClientResponse.parse(enriched));
});

export default router;
