"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getSessionFromCookie, setSessionCookie } from "@/lib/auth";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import {
  alertActionSchema,
  childProfileSchema,
  incidentSchema,
  mockEventSchema,
  monitorSchema,
  reportSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validators";
import {
  createIncidentForUser,
  createMockEventsForUser,
  createReportForUser,
  dismissAlertForUser,
  ensureDemoUser,
  escalateAlertForUser,
  deleteWorkspaceForUser,
  getStore,
  loginUser,
  markAlertAsIncidentForUser,
  recordAudit,
  recordConsent,
  requestExportForUser,
  signUpUser,
  updateChildProfileForUser,
  updateIncidentForUser,
  updateMonitorForUser,
} from "@/lib/store";
import type { ConsentType } from "@/lib/types";

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

async function currentUserOrThrow() {
  const store = getStore();
  const session = await getSessionFromCookie();
  if (!session?.userId) {
    throw new Error("UNAUTHENTICATED");
  }
  const user = await store.findUserById(session.userId);
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

async function logConsent(
  userId: string,
  consentType: ConsentType,
  accepted: boolean,
  details: { legalResponsibleConfirmed?: boolean; privacyRulesAccepted?: boolean; childProfileId?: string | null } = {}
) {
  const store = getStore();
  await recordConsent({
    userId,
    childProfileId: details.childProfileId ?? null,
    consentType,
    accepted,
    legalResponsibleConfirmed: details.legalResponsibleConfirmed ?? false,
    privacyRulesAccepted: details.privacyRulesAccepted ?? false,
    version: "2026-06",
    ipAddress: null,
    userAgent: null,
  });
  await store.recordAudit({
    userId,
    childProfileId: details.childProfileId ?? null,
    action: `consent_${consentType.toLowerCase()}`,
    targetType: "consent",
    targetId: consentType,
    severity: accepted ? "info" : "warning",
    details: {
      accepted,
      legalResponsibleConfirmed: details.legalResponsibleConfirmed ?? false,
      privacyRulesAccepted: details.privacyRulesAccepted ?? false,
      disclaimer: LEGAL_DISCLAIMER,
    },
    ipAddress: null,
    userAgent: null,
  });
}

export async function signUpAction(formData: FormData) {
  const input = signUpSchema.parse({
    name: getString(formData.get("name")),
    email: getString(formData.get("email")),
    password: getString(formData.get("password")),
    legalResponsible: getCheckbox(formData.get("legalResponsible")),
    privacyRulesAccepted: getCheckbox(formData.get("privacyRulesAccepted")),
  });

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

  await logConsent(user.id, "LEGAL_RESPONSIBILITY", true, {
    legalResponsibleConfirmed: true,
    privacyRulesAccepted: input.privacyRulesAccepted,
  });
  await logConsent(user.id, "PRIVACY_RULES", true, {
    legalResponsibleConfirmed: input.legalResponsible,
    privacyRulesAccepted: true,
  });
  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "sign_up",
    targetType: "auth",
    targetId: user.id,
    severity: "notice",
    details: { email: user.email, source: "onboarding" },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/");
  redirect("/child-profile");
}

export async function signInAction(formData: FormData) {
  const input = signInSchema.parse({
    email: getString(formData.get("email")),
    password: getString(formData.get("password")),
  });

  const user = await loginUser(input.email, input.password);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
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
    action: "sign_in",
    targetType: "auth",
    targetId: user.id,
    severity: "notice",
    details: { email: user.email, source: "sign-in" },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/");
  redirect("/dashboard");
}

export async function signInDemoAction() {
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
    action: "demo_sign_in",
    targetType: "auth",
    targetId: user.id,
    severity: "info",
    details: { source: "demo workspace" },
    ipAddress: null,
    userAgent: null,
  });
  redirect("/dashboard");
}

export async function signOutAction() {
  const store = getStore();
  const user = await currentUserOrThrow().catch(() => null);
  if (user) {
    await store.recordAudit({
      userId: user.id,
      childProfileId: null,
      action: "sign_out",
      targetType: "auth",
      targetId: user.id,
      severity: "info",
      details: { source: "sidebar" },
      ipAddress: null,
      userAgent: null,
    });
  }
  await clearSessionCookie();
  redirect("/");
}

export async function saveChildProfileAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = childProfileSchema.parse({
    name: getString(formData.get("name")),
    ageMonths: getString(formData.get("ageMonths")),
    developmentStage: getString(formData.get("developmentStage")),
    knownConditions: getString(formData.get("knownConditions")),
    wellbeingNotes: getString(formData.get("wellbeingNotes")),
    trustedCaregivers: getString(formData.get("trustedCaregivers")),
    regularLocations: getString(formData.get("regularLocations")),
    emergencyContacts: getString(formData.get("emergencyContacts")),
    pediatricianContact: getString(formData.get("pediatricianContact")),
  });

  const child = await updateChildProfileForUser(user.id, {
    name: input.name,
    ageMonths: input.ageMonths,
    developmentStage: input.developmentStage,
    knownConditions: input.knownConditions,
    wellbeingNotes: input.wellbeingNotes,
    trustedCaregivers: input.trustedCaregivers,
    regularLocations: input.regularLocations,
    emergencyContacts: input.emergencyContacts,
    pediatricianContact: input.pediatricianContact,
  });

  await recordAudit({
    userId: user.id,
    childProfileId: child.id,
    action: "save_child_profile",
    targetType: "child_profile",
    targetId: child.id,
    severity: "notice",
    details: { childName: child.name },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/child-profile");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveIncidentAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = incidentSchema.parse({
    id: getString(formData.get("id")) || undefined,
    status: getString(formData.get("status")) || "open",
    whatHappened: getString(formData.get("whatHappened")),
    whoWasPresent: getString(formData.get("whoWasPresent")),
    whereDidItHappen: getString(formData.get("whereDidItHappen")),
    whenDidItHappen: getString(formData.get("whenDidItHappen")),
    whatDidChildSayOrDo: getString(formData.get("whatDidChildSayOrDo")),
    physicalSigns: getString(formData.get("physicalSigns")),
    emotionalSigns: getString(formData.get("emotionalSigns")),
    evidenceAttached: getCheckbox(formData.get("evidenceAttached")),
    followUpNeeded: getString(formData.get("followUpNeeded")),
    notes: getString(formData.get("notes")),
    reviewedByGuardian: getCheckbox(formData.get("reviewedByGuardian")),
    savedClipLabel: getString(formData.get("savedClipLabel")),
  });

  const incident = input.id
    ? await updateIncidentForUser(user.id, input.id, {
        status: input.status,
        whatHappened: input.whatHappened,
        whoWasPresent: input.whoWasPresent,
        whereDidItHappen: input.whereDidItHappen,
        whenDidItHappen: input.whenDidItHappen,
        whatDidChildSayOrDo: input.whatDidChildSayOrDo,
        physicalSigns: input.physicalSigns,
        emotionalSigns: input.emotionalSigns,
        evidenceAttached: input.evidenceAttached,
        followUpNeeded: input.followUpNeeded,
        notes: input.notes,
        reviewedByGuardian: input.reviewedByGuardian,
        savedClipLabel: input.savedClipLabel,
      })
    : await createIncidentForUser(user.id, {
        status: input.status,
        whatHappened: input.whatHappened,
        whoWasPresent: input.whoWasPresent,
        whereDidItHappen: input.whereDidItHappen,
        whenDidItHappen: input.whenDidItHappen,
        whatDidChildSayOrDo: input.whatDidChildSayOrDo,
        physicalSigns: input.physicalSigns,
        emotionalSigns: input.emotionalSigns,
        evidenceAttached: input.evidenceAttached,
        followUpNeeded: input.followUpNeeded,
        notes: input.notes,
        reviewedByGuardian: input.reviewedByGuardian,
        savedClipLabel: input.savedClipLabel,
      });

  await recordAudit({
    userId: user.id,
    childProfileId: incident.childProfileId,
    action: input.id ? "update_incident" : "create_incident",
    targetType: "incident",
    targetId: incident.id,
    severity: "warning",
    details: { status: input.status, where: input.whereDidItHappen },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/incidents");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  redirect("/incidents");
}

export async function generateMockEventsAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = mockEventSchema.parse({
    scenario: getString(formData.get("scenario")) || "mixed",
  });
  await createMockEventsForUser(user.id, input.scenario);
  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "generate_mock_events",
    targetType: "sensor_events",
    targetId: input.scenario,
    severity: "info",
    details: { scenario: input.scenario },
    ipAddress: null,
    userAgent: null,
  });
  revalidatePath("/dashboard");
  revalidatePath("/monitor");
  revalidatePath("/patterns");
  revalidatePath("/reports");
  redirect("/dashboard");
}

export async function toggleMonitorAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = monitorSchema.parse({
    monitorModeEnabled: getCheckbox(formData.get("monitorModeEnabled")),
    audioModeEnabled: getCheckbox(formData.get("audioModeEnabled")),
    audioModeMuted: getCheckbox(formData.get("audioModeMuted")),
    saveIncidentClip: getCheckbox(formData.get("saveIncidentClip")),
    clipWarningAccepted: getCheckbox(formData.get("clipWarningAccepted")),
    savedClipLabel: getString(formData.get("savedClipLabel")),
  });

  const child = await updateMonitorForUser(user.id, input);
  await recordAudit({
    userId: user.id,
    childProfileId: child?.id ?? null,
    action: "toggle_monitor",
    targetType: "monitor",
    targetId: child?.id ?? null,
    severity: "notice",
    details: input,
    ipAddress: null,
    userAgent: null,
  });
  revalidatePath("/monitor");
  revalidatePath("/dashboard");
  redirect("/monitor");
}

export async function alertAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = alertActionSchema.parse({
    alertId: getString(formData.get("alertId")),
    action: getString(formData.get("action")) || "dismiss",
    note: getString(formData.get("note")),
  });

  if (input.action === "dismiss") {
    await dismissAlertForUser(user.id, input.alertId, input.note);
  } else if (input.action === "escalate") {
    await escalateAlertForUser(user.id, input.alertId, input.note);
  } else {
    await markAlertAsIncidentForUser(user.id, input.alertId);
  }

  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: `alert_${input.action}`,
    targetType: "alert",
    targetId: input.alertId,
    severity: input.action === "dismiss" ? "info" : "warning",
    details: { note: input.note },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/monitor");
  redirect("/dashboard");
}

export async function generateReportAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const input = reportSchema.parse({
    title: getString(formData.get("title")),
    guardianNotes: getString(formData.get("guardianNotes")),
    includeIncidents: getCheckbox(formData.get("includeIncidents")),
  });

  const report = await createReportForUser(user.id, {
    title: input.title,
    guardianNotes: input.guardianNotes,
    includeIncidents: input.includeIncidents,
  });

  if (!report) {
    throw new Error("REPORT_NOT_AVAILABLE");
  }

  await recordAudit({
    userId: user.id,
    childProfileId: report.childProfileId,
    action: "generate_report",
    targetType: "report",
    targetId: report.id,
    severity: "notice",
    details: { title: report.title },
    ipAddress: null,
    userAgent: null,
  });

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports");
}

export async function exportReportAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const reportId = getString(formData.get("reportId")) || null;
  const reason = getString(formData.get("reason"));
  await requestExportForUser(user.id, reportId, "pdf", reason);
  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "export_report",
    targetType: "report",
    targetId: reportId,
    severity: "notice",
    details: { format: "pdf", reason },
    ipAddress: null,
    userAgent: null,
  });
  revalidatePath("/reports");
  redirect("/reports");
}

export async function deleteWorkspaceAction(formData: FormData) {
  const user = await currentUserOrThrow();
  const confirmation = getString(formData.get("confirmDelete"));
  if (confirmation !== "DELETE") {
    throw new Error("DELETE_CONFIRMATION_REQUIRED");
  }
  await deleteWorkspaceForUser(user.id);
  await clearSessionCookie();
  await recordAudit({
    userId: user.id,
    childProfileId: null,
    action: "delete_workspace_request",
    targetType: "workspace",
    targetId: user.id,
    severity: "critical",
    details: { confirmation },
    ipAddress: null,
    userAgent: null,
  });
  revalidatePath("/");
  redirect("/");
}
