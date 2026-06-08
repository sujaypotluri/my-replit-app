import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, clientsTable, departmentsTable, seatsTable, auditLogsTable, activityEventsTable } from "@workspace/db";
import {
  GetUsersQueryParams,
  GetUsersResponse,
  GetUserParams,
  GetUserResponse,
  CreateUserBody,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
  DeleteUserParams,
  BulkInviteUsersBody,
  BulkInviteUsersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return null;

  const [client] = user.clientId
    ? await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, user.clientId))
    : [null];

  const [dept] = user.departmentId
    ? await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, user.departmentId))
    : [null];

  const [seat] = await db.select({ id: seatsTable.id }).from(seatsTable).where(eq(seatsTable.userId, userId));

  const inactiveDays = user.lastActiveAt
    ? Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    clientId: user.clientId ?? null,
    clientName: client?.name ?? null,
    departmentId: user.departmentId ?? null,
    departmentName: dept?.name ?? null,
    seatId: seat?.id ?? null,
    lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    inactiveDays,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", async (req, res): Promise<void> => {
  const params = GetUsersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let users = await db.select().from(usersTable).orderBy(usersTable.name);

  if (params.data.clientId != null) {
    users = users.filter((u) => u.clientId === params.data.clientId);
  }
  if (params.data.departmentId != null) {
    users = users.filter((u) => u.departmentId === params.data.departmentId);
  }
  if (params.data.role != null) {
    users = users.filter((u) => u.role === params.data.role);
  }
  if (params.data.status != null) {
    users = users.filter((u) => u.status === params.data.status);
  }

  const enriched = await Promise.all(users.map((u) => enrichUser(u.id)));
  res.json(GetUsersResponse.parse(enriched.filter(Boolean)));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    email: parsed.data.email,
    name: parsed.data.name,
    role: parsed.data.role,
    clientId: parsed.data.clientId ?? null,
    departmentId: parsed.data.departmentId ?? null,
    status: "pending",
  }).returning();

  await db.insert(activityEventsTable).values({
    type: "user_invited",
    message: `${user.name} was invited as ${user.role.replace("_", " ")}`,
    actor: "System",
    severity: "info",
  });

  const enriched = await enrichUser(user.id);
  res.status(201).json(GetUserResponse.parse(enriched));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const enriched = await enrichUser(params.data.id);
  if (!enriched) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetUserResponse.parse(enriched));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.role != null) updateData.role = parsed.data.role;
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.departmentId !== undefined) updateData.departmentId = parsed.data.departmentId;

  const [updated] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (parsed.data.role != null) {
    await db.insert(auditLogsTable).values({
      action: "role_changed",
      entityType: "role",
      entityId: updated.id,
      entityName: updated.name,
      performedBy: "Admin",
      performedByRole: "super_admin",
      details: `Role changed to ${parsed.data.role}`,
    });
  }

  const enriched = await enrichUser(updated.id);
  res.json(UpdateUserResponse.parse(enriched));
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await db.insert(auditLogsTable).values({
    action: "user_deleted",
    entityType: "user",
    entityId: deleted.id,
    entityName: deleted.name,
    performedBy: "Admin",
    performedByRole: "super_admin",
    details: `User ${deleted.email} removed from system`,
  });

  res.sendStatus(204);
});

router.post("/users/bulk-invite", async (req, res): Promise<void> => {
  const parsed = BulkInviteUsersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let invited = 0;
  const errors: string[] = [];

  for (const email of parsed.data.emails) {
    try {
      const name = email.split("@")[0].replace(/[._]/g, " ");
      await db.insert(usersTable).values({
        email,
        name,
        role: parsed.data.role,
        clientId: parsed.data.clientId,
        departmentId: parsed.data.departmentId ?? null,
        status: "pending",
      }).onConflictDoNothing();
      invited++;
    } catch {
      errors.push(`Failed to invite ${email}`);
    }
  }

  res.json(BulkInviteUsersResponse.parse({
    invited,
    failed: errors.length,
    total: parsed.data.emails.length,
    errors,
  }));
});

export default router;
