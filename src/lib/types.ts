export type GuardianRoleType =
  | "PRIMARY_GUARDIAN"
  | "SECONDARY_GUARDIAN"
  | "PEDIATRICIAN_VIEWER"
  | "SCHOOL_COUNSELOR_VIEWER"
  | "EMERGENCY_CONTACT";

export type RiskBand = "Low" | "Watch" | "Concerning" | "Urgent";

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "dismissed" | "escalated" | "resolved";
export type IncidentStatus = "draft" | "open" | "reviewed" | "shared";
export type ExportStatus = "pending" | "ready" | "failed";
export type ReportFormat = "pdf";
export type ConsentType =
  | "PRIVACY_RULES"
  | "LEGAL_RESPONSIBILITY"
  | "BABY_MONITOR"
  | "AUDIO_MODE"
  | "SHARE_REPORTS";

export type TimelineSource = "sensor" | "audio" | "manual" | "incident";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianRole {
  id: string;
  userId: string;
  childProfileId: string;
  role: GuardianRoleType;
  permissions: PermissionFlags;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionFlags {
  canView: boolean;
  canEditProfile: boolean;
  canLogIncidents: boolean;
  canEnableAudioMode: boolean;
  canDismissAlerts: boolean;
  canExportReports: boolean;
  canManageAccess: boolean;
}

export interface TrustedContact {
  id: string;
  childProfileId: string;
  name: string;
  relationship: string;
  role: GuardianRoleType;
  email?: string | null;
  phone?: string | null;
  canReceiveReports: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  childProfileId: string;
  label: string;
  description?: string | null;
  riskContext?: string | null;
  isFrequent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  createdById: string;
  name: string;
  ageMonths: number;
  developmentStage: string;
  knownConditions: string[];
  wellbeingNotes?: string | null;
  emergencyContacts: string[];
  pediatricianContact?: string | null;
  monitorModeEnabled: boolean;
  audioModeEnabled: boolean;
  audioModeMuted: boolean;
  monitorListening: boolean;
  consentConfirmed: boolean;
  riskBand: RiskBand;
  riskScore: number;
  lastSignalAt?: string | null;
  createdAt: string;
  updatedAt: string;
  trustedContacts: TrustedContact[];
  locations: Location[];
  guardianRoles: GuardianRole[];
}

export interface SensorEvent {
  id: string;
  childProfileId: string;
  eventType: string;
  source: TimelineSource;
  severity: AlertSeverity;
  confidence: number;
  occurredAt: string;
  durationSeconds?: number | null;
  notes: string;
  location?: string | null;
  contact?: string | null;
  reviewedByGuardian: boolean;
  createdAt: string;
}

export interface AudioSignalEvent {
  id: string;
  childProfileId: string;
  signalType: string;
  severity: AlertSeverity;
  confidence: number;
  occurredAt: string;
  windowSeconds: number;
  localOnly: boolean;
  summary: string;
  transcriptExcerpt?: string | null;
  rawAudioSaved: boolean;
  savedClipLabel?: string | null;
  reviewedByGuardian: boolean;
  createdAt: string;
}

export interface Incident {
  id: string;
  childProfileId: string;
  createdById: string;
  status: IncidentStatus;
  whatHappened: string;
  whoWasPresent: string[];
  whereDidItHappen: string;
  whenDidItHappen: string;
  whatDidChildSayOrDo: string;
  physicalSigns: string;
  emotionalSigns: string;
  evidenceAttached: boolean;
  followUpNeeded: string;
  notes?: string | null;
  reviewedByGuardian: boolean;
  savedClipLabel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScore {
  id: string;
  childProfileId: string;
  score: number;
  band: RiskBand;
  confidence: number;
  summary: string;
  recommendation: string;
  factors: RiskFactor[];
  windowDays: number;
  sourceVersion: string;
  calculatedAt: string;
}

export interface RiskFactor {
  title: string;
  value: number;
  note: string;
}

export interface Alert {
  id: string;
  childProfileId: string;
  severity: AlertSeverity;
  reason: string;
  confidence: number;
  suggestedAction: string;
  status: AlertStatus;
  source: TimelineSource;
  sourceLabel: string;
  relatedId?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedByGuardian: boolean;
}

export interface TimelineEntry {
  id: string;
  dateTime: string;
  signalType: string;
  severity: AlertSeverity;
  source: TimelineSource;
  confidence: number;
  notes: string;
  suggestedNextAction: string;
  reviewedByGuardian: boolean;
  relatedLabel?: string | null;
}

export interface PatternMatch {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  contextLabel: string;
  recommendedAction: string;
  signals: string[];
  lastObservedAt: string;
}

export interface Report {
  id: string;
  childProfileId: string;
  createdById: string;
  title: string;
  summary: string;
  riskBand: RiskBand;
  riskScore: number;
  timeline: TimelineEntry[];
  patterns: PatternMatch[];
  guardianNotes: string;
  attachedIncidentIds: string[];
  recommendedQuestions: string[];
  disclaimer: string;
  format: ReportFormat;
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  childProfileId?: string | null;
  userId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  severity: "info" | "notice" | "warning" | "critical";
  details: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  childProfileId?: string | null;
  consentType: ConsentType;
  accepted: boolean;
  legalResponsibleConfirmed: boolean;
  privacyRulesAccepted: boolean;
  version: string;
  grantedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ExportRequest {
  id: string;
  userId: string;
  childProfileId: string;
  reportId?: string | null;
  format: ReportFormat;
  status: ExportStatus;
  requestedReason?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  downloadToken: string;
}

export interface DashboardStats {
  currentStatus: string;
  riskBand: RiskBand;
  riskScore: number;
  confidence: number;
  last24hSummary: string;
  recentAlerts: number;
  activePatterns: number;
  incidentsTracked: number;
  cryingTrend: number[];
  moodTrend: number[];
  sleepTrend: number[];
}

export interface WorkspaceData {
  user: User;
  child: ChildProfile | null;
  permissions: PermissionFlags;
  roles: GuardianRole[];
  contacts: TrustedContact[];
  locations: Location[];
  sensorEvents: SensorEvent[];
  audioSignalEvents: AudioSignalEvent[];
  incidents: Incident[];
  riskScores: RiskScore[];
  alerts: Alert[];
  reports: Report[];
  auditLogs: AuditLog[];
  consentRecords: ConsentRecord[];
  exportRequests: ExportRequest[];
  timeline: TimelineEntry[];
  patterns: PatternMatch[];
  stats: DashboardStats;
  recentSummary: {
    cryDurationMinutes: number;
    noiseAlerts: number;
    missedResponses: number;
    wellbeingNotes: string[];
  };
  safeMode: {
    monitorModeEnabled: boolean;
    audioModeEnabled: boolean;
    audioModeMuted: boolean;
    monitoringIndicator: string;
  };
}

export interface PublicAuditEntry {
  action: string;
  label: string;
  severity: AuditLog["severity"];
}

