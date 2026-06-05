import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { ensureDemoUser, recordAudit } from "@/lib/store";

export async function POST() {
  const user = await ensureDemoUser();
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    issuedAt: Date.now(),
  });

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "api_demo_sign_in",
    targetType: "auth",
    targetId: user.id,
    severity: "info",
    details: { source: "demo workspace" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ user }, { status: 200 });
}

