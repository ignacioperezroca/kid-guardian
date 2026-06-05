import { z } from "zod";

const booleanField = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on" || value === 1) {
    return true;
  }
  if (value === false || value === "false" || value === "off" || value === 0) {
    return false;
  }
  return false;
}, z.boolean());

const requiredTrue = booleanField.refine((value) => value === true, {
  message: "This field must be accepted.",
});

const listField = z
  .string()
  .optional()
  .default("")
  .transform((value) =>
    value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );

export const signUpSchema = z.object({
  name: z.string().min(2, "Please enter the guardian name."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  legalResponsible: requiredTrue,
  privacyRulesAccepted: requiredTrue,
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export const childProfileSchema = z.object({
  name: z.string().min(1),
  ageMonths: z.coerce.number().int().min(0).max(240),
  developmentStage: z.string().min(1),
  knownConditions: listField,
  wellbeingNotes: z.string().optional().default(""),
  trustedCaregivers: listField,
  regularLocations: listField,
  emergencyContacts: listField,
  pediatricianContact: z.string().optional().default(""),
});

export const incidentSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["draft", "open", "reviewed", "shared"]).default("open"),
  whatHappened: z.string().min(4),
  whoWasPresent: listField,
  whereDidItHappen: z.string().min(1),
  whenDidItHappen: z.string().min(1),
  whatDidChildSayOrDo: z.string().min(1),
  physicalSigns: z.string().optional().default(""),
  emotionalSigns: z.string().optional().default(""),
  evidenceAttached: booleanField.default(false),
  followUpNeeded: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  reviewedByGuardian: booleanField.default(false),
  savedClipLabel: z.string().optional().default(""),
});

export const monitorSchema = z.object({
  monitorModeEnabled: booleanField.default(false),
  audioModeEnabled: booleanField.default(false),
  audioModeMuted: booleanField.default(false),
  saveIncidentClip: booleanField.default(false),
  clipWarningAccepted: booleanField.default(false),
  savedClipLabel: z.string().optional().default(""),
});

export const alertActionSchema = z.object({
  alertId: z.string().min(1),
  action: z.enum(["dismiss", "escalate", "incident"]),
  note: z.string().optional().default(""),
});

export const reportSchema = z.object({
  title: z.string().optional().default(""),
  guardianNotes: z.string().optional().default(""),
  includeIncidents: booleanField.default(false),
});

export const mockEventSchema = z.object({
  scenario: z
    .enum([
      "crying_spike",
      "noise_burst",
      "silence_anomaly",
      "caregiver_delay",
      "distress_sequence",
      "mixed",
    ])
    .default("mixed"),
});

export const auditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ChildProfileInput = z.infer<typeof childProfileSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type MonitorInput = z.infer<typeof monitorSchema>;
export type AlertActionInput = z.infer<typeof alertActionSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type MockEventInput = z.infer<typeof mockEventSchema>;
