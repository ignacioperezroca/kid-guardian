import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { incidentSchema } from "@/lib/validators";
import { recordAudit, updateIncidentForUser } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/incidents/[id]">
) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = incidentSchema.parse(body);
  const incident = await updateIncidentForUser(user.id, id, input);

  await recordAudit({
    userId: user.id,
    childProfileId: incident.childProfileId,
    action: "api_update_incident",
    targetType: "incident",
    targetId: incident.id,
    severity: "notice",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ incident });
}
