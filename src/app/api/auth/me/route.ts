import { NextResponse } from "next/server";
import { getApiCurrentUser } from "@/lib/api";
import { recordAudit } from "@/lib/store";
import { getWorkspaceForUser } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_session",
    targetType: "auth",
    targetId: user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });
  return NextResponse.json({
    user,
    hasChildProfile: Boolean(workspace.child),
    childProfile: workspace.child,
  });
}
