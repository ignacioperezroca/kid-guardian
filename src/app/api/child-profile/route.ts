import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { childProfileSchema } from "@/lib/validators";
import { recordAudit, updateChildProfileForUser, getWorkspaceForUser } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_child_profile",
    targetType: "child_profile",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ childProfile: workspace.child });
}

export async function POST(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = childProfileSchema.parse(body);
  const child = await updateChildProfileForUser(user.id, input);

  await recordAudit({
    userId: user.id,
    childProfileId: child.id,
    action: "api_update_child_profile",
    targetType: "child_profile",
    targetId: child.id,
    severity: "notice",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ childProfile: child });
}

