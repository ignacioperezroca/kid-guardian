import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { mockEventSchema } from "@/lib/validators";
import { createMockEventsForUser, getWorkspaceForUser, recordAudit } from "@/lib/store";

export async function POST(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = mockEventSchema.parse(body);
  await createMockEventsForUser(user.id, input.scenario);

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "api_generate_mock_events",
    targetType: "sensor_events",
    targetId: input.scenario,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  const workspace = await getWorkspaceForUser(user.id);
  return NextResponse.json({ ok: true, workspace });
}

