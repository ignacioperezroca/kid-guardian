import { NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { json, readJsonBody } from "@/lib/api";
import { signInSchema } from "@/lib/validators";
import { loginUser, recordAudit } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = signInSchema.parse(body);
  const user = await loginUser(input.email, input.password);

  if (!user) {
    return json({ error: "Invalid email or password." }, 401);
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    issuedAt: Date.now(),
  });

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "api_sign_in",
    targetType: "auth",
    targetId: user.id,
    severity: "notice",
    details: { email: user.email },
    ipAddress: null,
    userAgent: null,
  });

  return json({ user }, 200);
}

