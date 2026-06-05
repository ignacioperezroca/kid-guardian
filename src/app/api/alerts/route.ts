import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { alertActionSchema } from "@/lib/validators";
import {
  dismissAlertForUser,
  escalateAlertForUser,
  getWorkspaceForUser,
  markAlertAsIncidentForUser,
  recordAudit,
} from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_alerts",
    targetType: "alerts",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });
  return NextResponse.json({ alerts: workspace.alerts });
}

export async function PATCH(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = alertActionSchema.parse(body);

  let result = null;
  if (input.action === "dismiss") {
    result = await dismissAlertForUser(user.id, input.alertId, input.note);
  } else if (input.action === "escalate") {
    result = await escalateAlertForUser(user.id, input.alertId, input.note);
  } else {
    result = await markAlertAsIncidentForUser(user.id, input.alertId);
  }

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: `api_alert_${input.action}`,
    targetType: input.action === "incident" ? "incident" : "alert",
    targetId: input.alertId,
    severity: input.action === "dismiss" ? "info" : "warning",
    details: { note: input.note },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ result });
}
