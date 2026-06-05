import type {
  AlertSeverity,
  GuardianRoleType,
  PermissionFlags,
  RiskBand,
} from "./types";

export const APP_NAME = "KidGuardian";
export const APP_TAGLINE =
  "Privacy-first child safety support for transparent, guardian-controlled monitoring.";

export const LEGAL_DISCLAIMER = `KidGuardian is a child safety support tool. It does not diagnose abuse, determine guilt, provide legal advice, or replace emergency services, medical professionals, therapists, schools, or child protection authorities. If a child is in immediate danger, contact emergency services or the appropriate child protection authority.`;

export const PRIVACY_RULES = [
  "No covert audio recording.",
  "No hidden background listening.",
  "No continuous raw audio storage by default.",
  "No facial recognition or biometric identification.",
  "No monitoring of adults or other children without consent.",
  "All audio modes are explicit, visible, and guardian-controlled.",
  "Raw audio is discarded by default after local analysis unless a short clip is explicitly saved as an incident record.",
];

export const ROLE_LABELS: Record<GuardianRoleType, string> = {
  PRIMARY_GUARDIAN: "Primary guardian",
  SECONDARY_GUARDIAN: "Secondary guardian",
  PEDIATRICIAN_VIEWER: "Pediatrician / therapist viewer",
  SCHOOL_COUNSELOR_VIEWER: "School counselor viewer",
  EMERGENCY_CONTACT: "Emergency contact",
};

export const ROLE_DESCRIPTIONS: Record<GuardianRoleType, string> = {
  PRIMARY_GUARDIAN: "Full access to configure the child profile, monitoring, incidents, reports, and exports.",
  SECONDARY_GUARDIAN: "Can review the workspace, add notes, and co-manage monitoring with limited exports.",
  PEDIATRICIAN_VIEWER: "Read-only professional viewer for structured reports and trend summaries.",
  SCHOOL_COUNSELOR_VIEWER: "Read-only school support viewer for patterns, reports, and guardian notes.",
  EMERGENCY_CONTACT: "Can receive shareable reports and emergency context when the guardian grants access.",
};

export const ROLE_PERMISSIONS: Record<GuardianRoleType, PermissionFlags> = {
  PRIMARY_GUARDIAN: {
    canView: true,
    canEditProfile: true,
    canLogIncidents: true,
    canEnableAudioMode: true,
    canDismissAlerts: true,
    canExportReports: true,
    canManageAccess: true,
  },
  SECONDARY_GUARDIAN: {
    canView: true,
    canEditProfile: true,
    canLogIncidents: true,
    canEnableAudioMode: true,
    canDismissAlerts: true,
    canExportReports: true,
    canManageAccess: false,
  },
  PEDIATRICIAN_VIEWER: {
    canView: true,
    canEditProfile: false,
    canLogIncidents: false,
    canEnableAudioMode: false,
    canDismissAlerts: false,
    canExportReports: true,
    canManageAccess: false,
  },
  SCHOOL_COUNSELOR_VIEWER: {
    canView: true,
    canEditProfile: false,
    canLogIncidents: false,
    canEnableAudioMode: false,
    canDismissAlerts: false,
    canExportReports: true,
    canManageAccess: false,
  },
  EMERGENCY_CONTACT: {
    canView: true,
    canEditProfile: false,
    canLogIncidents: false,
    canEnableAudioMode: false,
    canDismissAlerts: false,
    canExportReports: false,
    canManageAccess: false,
  },
};

export const RISK_BAND_LABELS: Record<RiskBand, string> = {
  Low: "Low",
  Watch: "Watch",
  Concerning: "Concerning",
  Urgent: "Urgent",
};

export const RISK_BAND_COPY: Record<RiskBand, string> = {
  Low: "Signals are currently limited. Continue documenting changes and keep monitoring transparently.",
  Watch: "There are emerging patterns worth keeping an eye on and logging with more detail.",
  Concerning:
    "There are repeated signals that merit a structured conversation with a pediatrician, therapist, or school counselor.",
  Urgent:
    "There are strong safety signals. If a child may be in immediate danger, contact emergency services or the appropriate child protection authority.",
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ALERT_TONES: Record<AlertSeverity, string> = {
  low: "border-[color:var(--color-success)]/25 bg-[color:var(--color-success)]/8 text-[color:var(--color-success)]",
  medium:
    "border-[color:var(--color-warning)]/35 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
  high: "border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
  critical:
    "border-[color:var(--color-danger)]/45 bg-[color:var(--color-danger)]/15 text-[color:var(--color-danger)]",
};

export const BAND_TONES: Record<RiskBand, string> = {
  Low: "border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/8 text-[color:var(--color-success)]",
  Watch: "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
  Concerning: "border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
  Urgent: "border-[color:var(--color-danger)]/45 bg-[color:var(--color-danger)]/15 text-[color:var(--color-danger)]",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/child-profile", label: "Child profile" },
  { href: "/monitor", label: "Monitor mode" },
  { href: "/incidents", label: "Incidents" },
  { href: "/patterns", label: "Patterns" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export const DEFAULT_REPORT_QUESTIONS = [
  "What additional context would help confirm whether this pattern is situational or recurring?",
  "Are there any developmental, medical, sleep, or environmental factors that could also explain these signals?",
  "What observation period or documentation would be most useful before the next appointment?",
  "What immediate safety steps should we take if the situation escalates?",
];

export const AUDIO_SIGNAL_LABELS: Record<string, string> = {
  crying: "Crying",
  screaming: "Screaming",
  shouting: "Shouting",
  aggressive_tone: "Aggressive tone",
  distress: "Repeated distress",
  glass: "Breaking glass / impact",
  help_call: "Call for help",
  urgent_keyword: "Urgent safety keyword",
  silence_anomaly: "Silence anomaly",
  caregiver_delay: "Caregiver response delay",
  feeding: "Feeding",
  sleep: "Sleep",
  diaper: "Diaper",
  medication: "Medication",
  mood: "Mood",
  note: "Guardian note",
};

export const DEMO_CHILD_NAME = "Mila";
export const DEMO_USER_EMAIL = "guardian@kidguardian.local";
export const DEMO_USER_PASSWORD = "demo-kidguardian";

