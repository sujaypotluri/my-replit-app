import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, departmentsTable, clientsTable, usersTable, seatsTable } from "@workspace/db";
import {
  GetDepartmentsQueryParams,
  GetDepartmentsResponse,
  CreateDepartmentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments", async (req, res): Promise<void> => {
  const params = GetDepartmentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      clientId: departmentsTable.clientId,
      clientName: clientsTable.name,
      memberCount: sql<number>`cast(count(distinct ${usersTable.id}) as int)`,
      activeSeatCount: sql<number>`cast(count(distinct case when ${seatsTable.status} = 'active' then ${seatsTable.id} end) as int)`,
      createdAt: departmentsTable.createdAt,
    })
    .from(departmentsTable)
    .leftJoin(clientsTable, eq(departmentsTable.clientId, clientsTable.id))
    .leftJoin(usersTable, eq(usersTable.departmentId, departmentsTable.id))
    .leftJoin(seatsTable, eq(seatsTable.userId, usersTable.id))
    .groupBy(departmentsTable.id, departmentsTable.name, departmentsTable.clientId, clientsTable.name, departmentsTable.createdAt);

  const departments = await query;

  const filtered = params.data.clientId != null
    ? departments.filter((d) => d.clientId === params.data.clientId)
    : departments;

  res.json(GetDepartmentsResponse.parse(filtered));
});

router.post("/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [dept] = await db.insert(departmentsTable).values(parsed.data).returning();

  const [client] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, dept.clientId));

  res.status(201).json({
    id: dept.id,
    name: dept.name,
    clientId: dept.clientId,
    clientName: client?.name ?? null,
    memberCount: 0,
    activeSeatCount: 0,
    createdAt: dept.createdAt,
  });
});

export default router;
