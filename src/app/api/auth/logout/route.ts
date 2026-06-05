import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";
import { recordAudit } from "@/lib/store";

export async function POST() {
  const session = await getSessionFromCookie();
  if (session) {
    await recordAudit({
      userId: session.userId,
      childProfileId: null,
      action: "api_sign_out",
      targetType: "auth",
      targetId: session.userId,
      severity: "info",
      details: { source: "api" },
      ipAddress: null,
      userAgent: null,
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}

