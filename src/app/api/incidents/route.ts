import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { incidentSchema } from "@/lib/validators";
import { createIncidentForUser, getWorkspaceForUser, recordAudit } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_incidents",
    targetType: "incident_log",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ incidents: workspace.incidents });
}

export async function POST(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = incidentSchema.parse(body);
  const incident = await createIncidentForUser(user.id, input);

  await recordAudit({
    userId: user.id,
    childProfileId: incident.childProfileId,
    action: "api_create_incident",
    targetType: "incident",
    targetId: incident.id,
    severity: "warning",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ incident }, { status: 201 });
}

