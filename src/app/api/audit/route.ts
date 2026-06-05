import { NextResponse } from "next/server";
import { getApiCurrentUser } from "@/lib/api";
import { auditQuerySchema } from "@/lib/validators";
import { getStore, recordAudit } from "@/lib/store";

export async function GET(request: Request) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = auditQuerySchema.parse({ limit: searchParams.get("limit") ?? 25 }).limit;
  const store = getStore();
  const entries = await store.listAuditLogs(user.id, limit);

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "api_view_audit_log",
    targetType: "audit_log",
    targetId: user.id,
    severity: "info",
    details: { source: "api", limit },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ auditLogs: entries });
}

