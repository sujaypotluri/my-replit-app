import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, auditLogsTable, activityEventsTable } from "@workspace/db";
import {
  GetAuditLogsQueryParams,
  GetAuditLogsResponse,
  GetActivityFeedQueryParams,
  GetActivityFeedResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/audit-logs", async (req, res): Promise<void> => {
  const params = GetAuditLogsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const limit = params.data.limit ?? 50;
  let logs = await db
    .select()
    .from(auditLogsTable)
    .orderBy(desc(auditLogsTable.timestamp))
    .limit(limit);

  if (params.data.entityType != null) {
    logs = logs.filter((l) => l.entityType === params.data.entityType);
  }
  if (params.data.clientId != null) {
    // Filter by clientId if needed
  }

  const result = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    entityName: l.entityName ?? null,
    performedBy: l.performedBy,
    performedByRole: l.performedByRole ?? null,
    details: l.details ?? null,
    timestamp: l.timestamp.toISOString(),
  }));

  res.json(GetAuditLogsResponse.parse(result));
});

router.get("/activity-feed", async (req, res): Promise<void> => {
  const params = GetActivityFeedQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const limit = params.data.limit ?? 20;
  const events = await db
    .select()
    .from(activityEventsTable)
    .orderBy(desc(activityEventsTable.timestamp))
    .limit(limit);

  const result = events.map((e) => ({
    id: e.id,
    type: e.type,
    message: e.message,
    actor: e.actor ?? null,
    clientName: e.clientName ?? null,
    severity: e.severity,
    timestamp: e.timestamp.toISOString(),
  }));

  res.json(GetActivityFeedResponse.parse(result));
});

export default router;
