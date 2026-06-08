import { Router, type IRouter } from "express";
import { db, campaignsTable, seatsTable, licensesTable, usersTable, departmentsTable, clientsTable } from "@workspace/db";
import { sql, eq, count, sum } from "drizzle-orm";
import {
  GetDashboardStatsResponse,
  GetCampaignsQueryParams,
  GetCampaignsResponse,
  GetAnalyticsBreakdownQueryParams,
  GetAnalyticsBreakdownResponse,
  GetAnalyticsTrendsQueryParams,
  GetAnalyticsTrendsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (req, res): Promise<void> => {
  const [seatStats] = await db
    .select({
      activeSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'active' then 1 end) as int)`,
      inactiveSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'inactive' then 1 end) as int)`,
      atRiskSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'at_risk' then 1 end) as int)`,
      availableSeats: sql<number>`cast(count(case when ${seatsTable.status} = 'available' then 1 end) as int)`,
      totalSeats: sql<number>`cast(count(*) as int)`,
    })
    .from(seatsTable);

  const [campaignStats] = await db
    .select({
      totalImpressions: sql<number>`cast(coalesce(sum(${campaignsTable.impressions}), 0) as int)`,
      leadsCapured: sql<number>`cast(coalesce(sum(${campaignsTable.leads}), 0) as int)`,
      avgCtr: sql<number>`coalesce(avg(${campaignsTable.ctr}), 0)`,
    })
    .from(campaignsTable);

  const [licenseStats] = await db
    .select({
      totalLicenses: sql<number>`cast(count(*) as int)`,
    })
    .from(licensesTable);

  const activeSeats = seatStats?.activeSeats ?? 0;
  const totalSeats = seatStats?.totalSeats ?? 0;
  const utilizationRate = totalSeats > 0 ? (activeSeats / totalSeats) * 100 : 0;

  const result = GetDashboardStatsResponse.parse({
    totalImpressions: campaignStats?.totalImpressions ?? 0,
    ctr: Number((campaignStats?.avgCtr ?? 0).toFixed(2)),
    leadsCapured: campaignStats?.leadsCapured ?? 0,
    activeSeats: seatStats?.activeSeats ?? 0,
    inactiveSeats: seatStats?.inactiveSeats ?? 0,
    availableLicenses: seatStats?.availableSeats ?? 0,
    totalLicenses: licenseStats?.totalLicenses ?? 0,
    supportLoad: Math.floor(Math.random() * 20 + 5),
    utilizationRate: Number(utilizationRate.toFixed(1)),
    atRiskSeats: seatStats?.atRiskSeats ?? 0,
  });

  res.json(result);
});

router.get("/analytics/campaigns", async (req, res): Promise<void> => {
  const params = GetCampaignsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const campaigns = await db
    .select({
      id: campaignsTable.id,
      name: campaignsTable.name,
      clientId: campaignsTable.clientId,
      clientName: clientsTable.name,
      impressions: campaignsTable.impressions,
      ctr: campaignsTable.ctr,
      leads: campaignsTable.leads,
      leadQuality: campaignsTable.leadQuality,
      status: campaignsTable.status,
      startDate: campaignsTable.startDate,
      endDate: campaignsTable.endDate,
    })
    .from(campaignsTable)
    .leftJoin(clientsTable, eq(campaignsTable.clientId, clientsTable.id));

  res.json(GetCampaignsResponse.parse(campaigns));
});

router.get("/analytics/breakdown", async (req, res): Promise<void> => {
  const params = GetAnalyticsBreakdownQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const groupBy = params.data.groupBy;
  let breakdown: Array<{
    label: string;
    impressions: number;
    ctr: number;
    leads: number;
    seats: number;
    utilization: number;
  }> = [];

  if (groupBy === "client") {
    const rows = await db
      .select({
        label: clientsTable.name,
        impressions: sql<number>`cast(coalesce(sum(${campaignsTable.impressions}), 0) as int)`,
        ctr: sql<number>`coalesce(avg(${campaignsTable.ctr}), 0)`,
        leads: sql<number>`cast(coalesce(sum(${campaignsTable.leads}), 0) as int)`,
        seats: sql<number>`cast(coalesce((select count(*) from ${seatsTable} s join ${licensesTable} l on s.license_id = l.id where l.client_id = ${clientsTable.id}), 0) as int)`,
        utilization: sql<number>`0`,
      })
      .from(clientsTable)
      .leftJoin(campaignsTable, eq(campaignsTable.clientId, clientsTable.id))
      .groupBy(clientsTable.id, clientsTable.name);

    breakdown = rows.map((r) => ({
      label: r.label,
      impressions: r.impressions ?? 0,
      ctr: Number((r.ctr ?? 0).toFixed(2)),
      leads: r.leads ?? 0,
      seats: r.seats ?? 0,
      utilization: r.utilization ?? 0,
    }));
  } else if (groupBy === "department") {
    const rows = await db
      .select({
        label: departmentsTable.name,
        seats: sql<number>`cast(count(${usersTable.id}) as int)`,
        impressions: sql<number>`0`,
        ctr: sql<number>`0`,
        leads: sql<number>`0`,
        utilization: sql<number>`0`,
      })
      .from(departmentsTable)
      .leftJoin(usersTable, eq(usersTable.departmentId, departmentsTable.id))
      .groupBy(departmentsTable.id, departmentsTable.name);

    breakdown = rows.map((r) => ({
      label: r.label,
      impressions: 0,
      ctr: 0,
      leads: 0,
      seats: r.seats ?? 0,
      utilization: 0,
    }));
  } else {
    const roles = ["super_admin", "client_admin", "dept_manager", "end_user"];
    const roleLabels: Record<string, string> = {
      super_admin: "Super Admin",
      client_admin: "Client Admin",
      dept_manager: "Dept Manager",
      end_user: "End User",
    };

    const rows = await db
      .select({
        role: usersTable.role,
        seats: sql<number>`cast(count(*) as int)`,
      })
      .from(usersTable)
      .groupBy(usersTable.role);

    breakdown = roles.map((role) => {
      const found = rows.find((r) => r.role === role);
      return {
        label: roleLabels[role] ?? role,
        impressions: 0,
        ctr: 0,
        leads: 0,
        seats: found?.seats ?? 0,
        utilization: 0,
      };
    });
  }

  res.json(GetAnalyticsBreakdownResponse.parse(breakdown));
});

router.get("/analytics/trends", async (req, res): Promise<void> => {
  const params = GetAnalyticsTrendsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const days = params.data.days ?? 30;
  const metric = params.data.metric;

  const trendPoints = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    let value = 0;

    if (metric === "impressions") value = Math.floor(Math.random() * 50000 + 10000);
    else if (metric === "ctr") value = Number((Math.random() * 5 + 1).toFixed(2));
    else if (metric === "leads") value = Math.floor(Math.random() * 500 + 50);
    else if (metric === "seats") value = Math.floor(Math.random() * 20 + 80);
    else if (metric === "utilization") value = Number((Math.random() * 20 + 70).toFixed(1));

    trendPoints.push({ date: dateStr, value });
  }

  res.json(GetAnalyticsTrendsResponse.parse(trendPoints));
});

export default router;
