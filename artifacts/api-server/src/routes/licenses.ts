import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, licensesTable, clientsTable, seatsTable, auditLogsTable, activityEventsTable, usersTable } from "@workspace/db";
import {
  GetLicensesQueryParams,
  GetLicensesResponse,
  GetLicenseParams,
  GetLicenseResponse,
  CreateLicenseBody,
  UpdateLicenseParams,
  UpdateLicenseBody,
  UpdateLicenseResponse,
  DeleteLicenseParams,
  GetLicensePoolSummaryQueryParams,
  GetLicensePoolSummaryResponse,
  GetSeatsQueryParams,
  GetSeatsResponse,
  AssignSeatParams,
  AssignSeatBody,
  AssignSeatResponse,
  ReleaseSeatParams,
  ReleaseSeatResponse,
  RevokeSeatParams,
  RevokeSeatResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichLicense(licenseId: number) {
  const [lic] = await db.select().from(licensesTable).where(eq(licensesTable.id, licenseId));
  if (!lic) return null;

  const [client] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, lic.clientId));

  const [seatStats] = await db
    .select({
      activeSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'active' then 1 end) as int)`,
      inactiveSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'inactive' then 1 end) as int)`,
      reservedSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'reserved' then 1 end) as int)`,
      atRiskSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'at_risk' then 1 end) as int)`,
      availableSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'available' then 1 end) as int)`,
    })
    .from(seatsTable)
    .where(eq(seatsTable.licenseId, licenseId));

  return {
    id: lic.id,
    name: lic.name,
    type: lic.type,
    clientId: lic.clientId,
    clientName: client?.name ?? null,
    totalSeats: lic.totalSeats,
    activeSeats: seatStats?.activeSeats ?? 0,
    inactiveSeats: seatStats?.inactiveSeats ?? 0,
    availableSeats: seatStats?.availableSeats ?? 0,
    reservedSeats: seatStats?.reservedSeats ?? 0,
    atRiskSeats: seatStats?.atRiskSeats ?? 0,
    status: lic.status,
    inactivityThresholdDays: lic.inactivityThresholdDays ?? null,
    autoRelease: lic.autoRelease,
    expiresAt: lic.expiresAt ?? null,
    createdAt: lic.createdAt.toISOString(),
  };
}

router.get("/licenses", async (req, res): Promise<void> => {
  const params = GetLicensesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let licenses = await db.select().from(licensesTable).orderBy(licensesTable.name);

  if (params.data.clientId != null) {
    licenses = licenses.filter((l) => l.clientId === params.data.clientId);
  }
  if (params.data.type != null) {
    licenses = licenses.filter((l) => l.type === params.data.type);
  }

  const enriched = await Promise.all(licenses.map((l) => enrichLicense(l.id)));
  res.json(GetLicensesResponse.parse(enriched.filter(Boolean)));
});

router.post("/licenses", async (req, res): Promise<void> => {
  const parsed = CreateLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lic] = await db.insert(licensesTable).values({
    name: parsed.data.name,
    type: parsed.data.type,
    clientId: parsed.data.clientId,
    totalSeats: parsed.data.totalSeats,
    inactivityThresholdDays: parsed.data.inactivityThresholdDays ?? null,
    autoRelease: parsed.data.autoRelease ?? false,
    expiresAt: parsed.data.expiresAt ?? null,
  }).returning();

  // Create seat rows
  const seatRows = Array.from({ length: parsed.data.totalSeats }, () => ({
    licenseId: lic.id,
    status: "available" as const,
  }));
  if (seatRows.length > 0) {
    await db.insert(seatsTable).values(seatRows);
  }

  await db.insert(auditLogsTable).values({
    action: "license_created",
    entityType: "license",
    entityId: lic.id,
    entityName: lic.name,
    performedBy: "Admin",
    performedByRole: "super_admin",
    details: `${parsed.data.type} license with ${parsed.data.totalSeats} seats created`,
  });

  const enriched = await enrichLicense(lic.id);
  res.status(201).json(GetLicenseResponse.parse(enriched));
});

router.get("/licenses/pool-summary", async (req, res): Promise<void> => {
  const params = GetLicensePoolSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let licenseQuery = db.select({ id: licensesTable.id, type: licensesTable.type, totalSeats: licensesTable.totalSeats }).from(licensesTable);
  if (params.data.clientId != null) {
    licenseQuery = licenseQuery.where(eq(licensesTable.clientId, params.data.clientId)) as typeof licenseQuery;
  }
  const licenses = await licenseQuery;
  const licenseIds = licenses.map((l) => l.id);

  let seatStats = {
    activeSeats: 0,
    inactiveSeats: 0,
    availableSeats: 0,
    atRiskSeats: 0,
    totalSeats: 0,
  };

  if (licenseIds.length > 0) {
    const [stats] = await db
      .select({
        activeSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'active' then 1 end) as int)`,
        inactiveSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'inactive' then 1 end) as int)`,
        availableSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'available' then 1 end) as int)`,
        atRiskSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'at_risk' then 1 end) as int)`,
        totalSeats: sql<number>`cast(count(*) as int)`,
      })
      .from(seatsTable)
      .where(sql`${seatsTable.licenseId} = any(${licenseIds})`);

    if (stats) {
      seatStats = {
        activeSeats: stats.activeSeats ?? 0,
        inactiveSeats: stats.inactiveSeats ?? 0,
        availableSeats: stats.availableSeats ?? 0,
        atRiskSeats: stats.atRiskSeats ?? 0,
        totalSeats: stats.totalSeats ?? 0,
      };
    }
  }

  const totalSeats = seatStats.totalSeats;
  const utilizationRate = totalSeats > 0 ? Number(((seatStats.activeSeats / totalSeats) * 100).toFixed(1)) : 0;
  const seedSeats = licenses.filter((l) => l.type === "seed").reduce((acc, l) => acc + l.totalSeats, 0);
  const purchaseSeats = licenses.filter((l) => l.type === "purchase").reduce((acc, l) => acc + l.totalSeats, 0);

  res.json(GetLicensePoolSummaryResponse.parse({
    totalLicenses: licenses.length,
    totalSeats,
    activeSeats: seatStats.activeSeats,
    inactiveSeats: seatStats.inactiveSeats,
    availableSeats: seatStats.availableSeats,
    atRiskSeats: seatStats.atRiskSeats,
    utilizationRate,
    seedSeats,
    purchaseSeats,
  }));
});

router.get("/licenses/:id", async (req, res): Promise<void> => {
  const params = GetLicenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const enriched = await enrichLicense(params.data.id);
  if (!enriched) {
    res.status(404).json({ error: "License not found" });
    return;
  }

  res.json(GetLicenseResponse.parse(enriched));
});

router.patch("/licenses/:id", async (req, res): Promise<void> => {
  const params = UpdateLicenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof licensesTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.totalSeats != null) updateData.totalSeats = parsed.data.totalSeats;
  if (parsed.data.inactivityThresholdDays !== undefined) updateData.inactivityThresholdDays = parsed.data.inactivityThresholdDays;
  if (parsed.data.autoRelease != null) updateData.autoRelease = parsed.data.autoRelease;
  if (parsed.data.status != null) updateData.status = parsed.data.status;

  const [updated] = await db
    .update(licensesTable)
    .set(updateData)
    .where(eq(licensesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "License not found" });
    return;
  }

  const enriched = await enrichLicense(updated.id);
  res.json(UpdateLicenseResponse.parse(enriched));
});

router.delete("/licenses/:id", async (req, res): Promise<void> => {
  const params = DeleteLicenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(licensesTable).where(eq(licensesTable.id, params.data.id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "License not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Seats ──────────────────────────────────────────────────────────────────────

router.get("/seats", async (req, res): Promise<void> => {
  const params = GetSeatsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let seats = await db
    .select({
      id: seatsTable.id,
      licenseId: seatsTable.licenseId,
      licenseName: licensesTable.name,
      userId: seatsTable.userId,
      userName: usersTable.name,
      userEmail: usersTable.email,
      status: seatsTable.status,
      assignedAt: seatsTable.assignedAt,
      lastActiveAt: seatsTable.lastActiveAt,
      createdAt: seatsTable.createdAt,
    })
    .from(seatsTable)
    .leftJoin(licensesTable, eq(seatsTable.licenseId, licensesTable.id))
    .leftJoin(usersTable, eq(seatsTable.userId, usersTable.id))
    .orderBy(seatsTable.id);

  if (params.data.licenseId != null) {
    seats = seats.filter((s) => s.licenseId === params.data.licenseId);
  }
  if (params.data.status != null) {
    seats = seats.filter((s) => s.status === params.data.status);
  }

  const result = seats.map((s) => {
    const inactiveDays = s.lastActiveAt
      ? Math.floor((Date.now() - new Date(s.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return {
      ...s,
      assignedAt: s.assignedAt?.toISOString() ?? null,
      lastActiveAt: s.lastActiveAt?.toISOString() ?? null,
      inactiveDays,
      createdAt: s.createdAt.toISOString(),
    };
  });

  res.json(GetSeatsResponse.parse(result));
});

router.post("/seats/:id/assign", async (req, res): Promise<void> => {
  const params = AssignSeatParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AssignSeatBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const seatId = parseInt(raw, 10);

  const [updated] = await db
    .update(seatsTable)
    .set({ userId: body.data.userId, status: "active", assignedAt: new Date(), lastActiveAt: new Date() })
    .where(eq(seatsTable.id, seatId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Seat not found" });
    return;
  }

  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, body.data.userId));
  const [lic] = await db.select({ name: licensesTable.name }).from(licensesTable).where(eq(licensesTable.id, updated.licenseId));

  await db.insert(activityEventsTable).values({
    type: "license_assigned",
    message: `Seat assigned to ${user?.name ?? "user"} on license "${lic?.name ?? "unknown"}"`,
    actor: "Admin",
    severity: "success",
  });

  await db.insert(auditLogsTable).values({
    action: "seat_assigned",
    entityType: "seat",
    entityId: updated.id,
    entityName: lic?.name ?? null,
    performedBy: "Admin",
    performedByRole: "super_admin",
    details: `Seat assigned to user ID ${body.data.userId}`,
  });

  const inactiveDays = updated.lastActiveAt
    ? Math.floor((Date.now() - new Date(updated.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  res.json(AssignSeatResponse.parse({
    id: updated.id,
    licenseId: updated.licenseId,
    licenseName: lic?.name ?? null,
    userId: updated.userId ?? null,
    userName: user?.name ?? null,
    userEmail: null,
    status: updated.status,
    assignedAt: updated.assignedAt?.toISOString() ?? null,
    lastActiveAt: updated.lastActiveAt?.toISOString() ?? null,
    inactiveDays,
    createdAt: updated.createdAt.toISOString(),
  }));
});

router.post("/seats/:id/release", async (req, res): Promise<void> => {
  const params = ReleaseSeatParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(seatsTable)
    .set({ userId: null, status: "available", assignedAt: null })
    .where(eq(seatsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Seat not found" });
    return;
  }

  await db.insert(activityEventsTable).values({
    type: "seat_released",
    message: `Seat #${updated.id} released and returned to pool`,
    actor: "Admin",
    severity: "info",
  });

  await db.insert(auditLogsTable).values({
    action: "seat_released",
    entityType: "seat",
    entityId: updated.id,
    performedBy: "Admin",
    performedByRole: "super_admin",
    details: "Seat manually released",
  });

  res.json(ReleaseSeatResponse.parse({
    id: updated.id,
    licenseId: updated.licenseId,
    licenseName: null,
    userId: null,
    userName: null,
    userEmail: null,
    status: updated.status,
    assignedAt: null,
    lastActiveAt: updated.lastActiveAt?.toISOString() ?? null,
    inactiveDays: null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

router.post("/seats/:id/revoke", async (req, res): Promise<void> => {
  const params = RevokeSeatParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(seatsTable)
    .set({ userId: null, status: "reserved", assignedAt: null })
    .where(eq(seatsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Seat not found" });
    return;
  }

  await db.insert(activityEventsTable).values({
    type: "seat_revoked",
    message: `Seat #${updated.id} was revoked by admin`,
    actor: "Admin",
    severity: "warning",
  });

  await db.insert(auditLogsTable).values({
    action: "seat_revoked",
    entityType: "seat",
    entityId: updated.id,
    performedBy: "Admin",
    performedByRole: "super_admin",
    details: "Seat forcibly revoked (admin override)",
  });

  res.json(RevokeSeatResponse.parse({
    id: updated.id,
    licenseId: updated.licenseId,
    licenseName: null,
    userId: null,
    userName: null,
    userEmail: null,
    status: updated.status,
    assignedAt: null,
    lastActiveAt: updated.lastActiveAt?.toISOString() ?? null,
    inactiveDays: null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

export default router;
