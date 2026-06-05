import { NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { json, readJsonBody } from "@/lib/api";
import { signUpSchema } from "@/lib/validators";
import { recordAudit, recordConsent, signUpUser } from "@/lib/store";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = signUpSchema.parse(body);

  try {
    const user = await signUpUser({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      issuedAt: Date.now(),
    });

    await recordConsent({
      userId: user.id,
      childProfileId: null,
      consentType: "LEGAL_RESPONSIBILITY",
      accepted: true,
      legalResponsibleConfirmed: true,
      privacyRulesAccepted: input.privacyRulesAccepted,
      version: "2026-06",
      ipAddress: null,
      userAgent: null,
    });
    await recordConsent({
      userId: user.id,
      childProfileId: null,
      consentType: "PRIVACY_RULES",
      accepted: true,
      legalResponsibleConfirmed: input.legalResponsible,
      privacyRulesAccepted: true,
      version: "2026-06",
      ipAddress: null,
      userAgent: null,
    });
    await recordAudit({
      userId: user.id,
      childProfileId: null,
      action: "api_sign_up",
      targetType: "auth",
      targetId: user.id,
      severity: "notice",
      details: { email: user.email, disclaimer: LEGAL_DISCLAIMER },
      ipAddress: null,
      userAgent: null,
    });

    return json({ user }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return json({ error: "Email already exists." }, 409);
    }
    throw error;
  }
}
