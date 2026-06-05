import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { monitorSchema } from "@/lib/validators";
import { getWorkspaceForUser, recordAudit, updateMonitorForUser } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_monitor",
    targetType: "monitor",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ safeMode: workspace.safeMode, childProfile: workspace.child });
}

export async function POST(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = monitorSchema.parse(body);
  const child = await updateMonitorForUser(user.id, input);

  await recordAudit({
    userId: user.id,
    childProfileId: child?.id ?? null,
    action: "api_update_monitor",
    targetType: "monitor",
    targetId: child?.id ?? null,
    severity: "notice",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ childProfile: child });
}

