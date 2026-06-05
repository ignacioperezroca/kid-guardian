import { NextResponse } from "next/server";
import { getApiCurrentUser } from "@/lib/api";
import { deleteWorkspaceForUser, getWorkspaceForUser, recordAudit } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_workspace",
    targetType: "workspace",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });
  return NextResponse.json(workspace);
}

export async function DELETE() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "api_delete_workspace",
    targetType: "workspace",
    targetId: result.childId,
    severity: "critical",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ ok: true, deletedChildId: result.childId });
}
