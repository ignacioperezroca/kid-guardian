import {
  APP_NAME,
  DEMO_CHILD_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  LEGAL_DISCLAIMER,
  ROLE_PERMISSIONS,
} from "./constants";
import type {
  AudioSignalEvent,
  AuditLog,
  ChildProfile,
  ConsentRecord,
  ExportRequest,
  GuardianRole,
  Incident,
  Location,
  Report,
  RiskScore,
  SensorEvent,
  TimelineEntry,
  TrustedContact,
  User,
  WorkspaceData,
} from "./types";
import { calculateRiskScore } from "./risk";
import { detectPatterns, patternSummary } from "./patterns";
import { deriveAlerts } from "./alerts";

function nowMinus(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const demoUser: User = {
  id: "demo-user",
  name: "Alex Rivera",
  email: DEMO_USER_EMAIL,
  isDemo: true,
  passwordHash: DEMO_USER_PASSWORD,
  createdAt: nowMinus(60 * 24),
  updatedAt: nowMinus(5),
};

const demoChildId = "demo-child";

const demoContacts: TrustedContact[] = [
  {
    id: makeId("contact"),
    childProfileId: demoChildId,
    name: "Dr. Priya Shah",
    relationship: "Pediatrician",
    role: "PEDIATRICIAN_VIEWER",
    email: "priya.shah@example.com",
    phone: "+1 (555) 0198",
    canReceiveReports: true,
    createdAt: nowMinus(1200),
    updatedAt: nowMinus(1200),
  },
  {
    id: makeId("contact"),
    childProfileId: demoChildId,
    name: "Jordan Rivera",
    relationship: "Secondary guardian",
    role: "SECONDARY_GUARDIAN",
    email: "jordan@example.com",
    phone: "+1 (555) 0144",
    canReceiveReports: true,
    createdAt: nowMinus(1200),
    updatedAt: nowMinus(1200),
  },
];

const demoLocations: Location[] = [
  {
    id: makeId("location"),
    childProfileId: demoChildId,
    label: "Home",
    description: "Primary residence",
    riskContext: "Routine bedtime and daily care",
    isFrequent: true,
    createdAt: nowMinus(1200),
    updatedAt: nowMinus(1200),
  },
  {
    id: makeId("location"),
    childProfileId: demoChildId,
    label: "Weekend caregiver home",
    description: "Shared visit location",
    riskContext: "Distress has appeared after some weekend transitions",
    isFrequent: true,
    createdAt: nowMinus(1200),
    updatedAt: nowMinus(1200),
  },
];

const demoRoles: GuardianRole[] = [
  {
    id: makeId("role"),
    userId: demoUser.id,
    childProfileId: demoChildId,
    role: "PRIMARY_GUARDIAN",
    permissions: ROLE_PERMISSIONS.PRIMARY_GUARDIAN,
    active: true,
    createdAt: nowMinus(1200),
    updatedAt: nowMinus(1200),
  },
];

const demoChild: ChildProfile = {
  id: demoChildId,
  createdById: demoUser.id,
  name: DEMO_CHILD_NAME,
  ageMonths: 18,
  developmentStage: "Toddler",
  knownConditions: ["Sensitive sleep transitions"],
  wellbeingNotes:
    "Regular mood changes appear after late routines. Caregiver logs are kept transparent and brief.",
  emergencyContacts: ["Jordan Rivera", "Dr. Priya Shah", "Emergency services"],
  pediatricianContact: "Dr. Priya Shah",
  monitorModeEnabled: true,
  audioModeEnabled: true,
  audioModeMuted: false,
  monitorListening: true,
  consentConfirmed: true,
  riskBand: "Concerning",
  riskScore: 64,
  lastSignalAt: nowMinus(22),
  createdAt: nowMinus(1100),
  updatedAt: nowMinus(10),
  trustedContacts: demoContacts,
  locations: demoLocations,
  guardianRoles: demoRoles,
};

const demoSensorEvents: SensorEvent[] = [
  {
    id: makeId("sensor"),
    childProfileId: demoChildId,
    eventType: "crying",
    source: "audio",
    severity: "high",
    confidence: 91,
    occurredAt: nowMinus(28),
    durationSeconds: 18 * 60,
    notes: "Crying lasted longer than expected during a bedtime transition.",
    location: "Home",
    contact: "Alex Rivera",
    reviewedByGuardian: true,
    createdAt: nowMinus(27),
  },
  {
    id: makeId("sensor"),
    childProfileId: demoChildId,
    eventType: "caregiver_delay",
    source: "sensor",
    severity: "medium",
    confidence: 78,
    occurredAt: nowMinus(24),
    durationSeconds: 8 * 60,
    notes: "Response delay appeared after a noisy transition.",
    location: "Weekend caregiver home",
    contact: "Jordan Rivera",
    reviewedByGuardian: false,
    createdAt: nowMinus(24),
  },
  {
    id: makeId("sensor"),
    childProfileId: demoChildId,
    eventType: "sleep",
    source: "manual",
    severity: "low",
    confidence: 69,
    occurredAt: nowMinus(11 * 60),
    durationSeconds: 92 * 60,
    notes: "Sleep was shorter than baseline after the weekend visit.",
    location: "Home",
    contact: "Alex Rivera",
    reviewedByGuardian: true,
    createdAt: nowMinus(11 * 60),
  },
  {
    id: makeId("sensor"),
    childProfileId: demoChildId,
    eventType: "mood",
    source: "manual",
    severity: "medium",
    confidence: 72,
    occurredAt: nowMinus(9 * 60),
    durationSeconds: undefined,
    notes: "Appeared withdrawn and less playful than usual.",
    location: "Home",
    contact: "Alex Rivera",
    reviewedByGuardian: false,
    createdAt: nowMinus(9 * 60),
  },
];

const demoAudioEvents: AudioSignalEvent[] = [
  {
    id: makeId("audio"),
    childProfileId: demoChildId,
    signalType: "crying",
    severity: "medium",
    confidence: 84,
    occurredAt: nowMinus(42),
    windowSeconds: 30,
    localOnly: true,
    summary: "Local audio analysis detected sustained crying in a short window.",
    transcriptExcerpt: null,
    rawAudioSaved: false,
    savedClipLabel: null,
    reviewedByGuardian: true,
    createdAt: nowMinus(42),
  },
  {
    id: makeId("audio"),
    childProfileId: demoChildId,
    signalType: "shouting",
    severity: "high",
    confidence: 77,
    occurredAt: nowMinus(34),
    windowSeconds: 20,
    localOnly: true,
    summary: "A loud shouting signal was detected, but no raw audio is stored by default.",
    transcriptExcerpt: null,
    rawAudioSaved: false,
    savedClipLabel: null,
    reviewedByGuardian: false,
    createdAt: nowMinus(34),
  },
  {
    id: makeId("audio"),
    childProfileId: demoChildId,
    signalType: "silence_anomaly",
    severity: "medium",
    confidence: 68,
    occurredAt: nowMinus(18),
    windowSeconds: 45,
    localOnly: true,
    summary: "A silence anomaly was detected during an expected active period.",
    transcriptExcerpt: null,
    rawAudioSaved: false,
    savedClipLabel: null,
    reviewedByGuardian: false,
    createdAt: nowMinus(18),
  },
];

const demoIncidents: Incident[] = [
  {
    id: makeId("incident"),
    childProfileId: demoChildId,
    createdById: demoUser.id,
    status: "reviewed",
    whatHappened:
      "The child became tearful and withdrawn after the transition home, with a longer-than-usual sleep wind-down.",
    whoWasPresent: ["Alex Rivera", "Jordan Rivera"],
    whereDidItHappen: "Home",
    whenDidItHappen: nowMinus(30),
    whatDidChildSayOrDo: "Reached for the caregiver and then avoided eye contact.",
    physicalSigns: "No visible injury noted.",
    emotionalSigns: "Fearful, quiet, and unusually clingy.",
    evidenceAttached: false,
    followUpNeeded: "Check sleep and appetite notes for the next few days.",
    notes: "Observed after a routine transition; no accusation implied.",
    reviewedByGuardian: true,
    savedClipLabel: null,
    createdAt: nowMinus(30),
    updatedAt: nowMinus(18),
  },
  {
    id: makeId("incident"),
    childProfileId: demoChildId,
    createdById: demoUser.id,
    status: "open",
    whatHappened:
      "A second distress episode followed a visit change, with crying and a delayed response to comfort.",
    whoWasPresent: ["Alex Rivera", "Weekend caregiver"],
    whereDidItHappen: "Weekend caregiver home",
    whenDidItHappen: nowMinus(26),
    whatDidChildSayOrDo: "Said 'no' repeatedly and moved away from the room.",
    physicalSigns: "No obvious physical signs observed.",
    emotionalSigns: "Anxious, tense, and tired.",
    evidenceAttached: false,
    followUpNeeded: "Document what happened before and after the next visit.",
    notes: "Use neutral wording and keep details factual.",
    reviewedByGuardian: false,
    savedClipLabel: null,
    createdAt: nowMinus(26),
    updatedAt: nowMinus(16),
  },
];

function buildWorkspace(): WorkspaceData {
  const risk = calculateRiskScore({
    events: demoSensorEvents,
    audioEvents: demoAudioEvents,
    incidents: demoIncidents,
    guardianNotes: demoChild.wellbeingNotes ?? "",
  });

  const riskScore: RiskScore = {
    id: makeId("risk"),
    childProfileId: demoChildId,
    score: risk.score,
    band: risk.band,
    confidence: risk.confidence,
    summary: risk.summary,
    recommendation: risk.recommendation,
    factors: risk.factors,
    windowDays: 30,
    sourceVersion: "demo-v1",
    calculatedAt: nowMinus(8),
  };

  const patterns = detectPatterns({
    incidents: demoIncidents,
    sensorEvents: demoSensorEvents,
    audioEvents: demoAudioEvents,
  });

  const alerts = deriveAlerts({
    childProfileId: demoChildId,
    events: demoSensorEvents,
    audioEvents: demoAudioEvents,
    incidents: demoIncidents,
    monitorAudioEnabled: demoChild.audioModeEnabled,
  });

  const timeline: TimelineEntry[] = [
    ...demoSensorEvents.map((event): TimelineEntry => ({
      id: event.id,
      dateTime: event.occurredAt,
      signalType: event.eventType,
      severity: event.severity,
      source: event.source,
      confidence: event.confidence,
      notes: event.notes,
      suggestedNextAction: "Add a brief note about what happened before and after this moment.",
      reviewedByGuardian: event.reviewedByGuardian,
      relatedLabel: event.location ?? event.contact ?? null,
    })),
    ...demoAudioEvents.map((event): TimelineEntry => ({
      id: event.id,
      dateTime: event.occurredAt,
      signalType: event.signalType,
      severity: event.severity,
      source: "audio" as const,
      confidence: event.confidence,
      notes: event.summary,
      suggestedNextAction:
        event.rawAudioSaved && event.transcriptExcerpt
          ? "Review the saved excerpt carefully and add a structured incident if needed."
          : "Record context while the event is fresh. Raw audio is not stored by default.",
      reviewedByGuardian: event.reviewedByGuardian,
      relatedLabel: event.savedClipLabel ?? null,
    })),
    ...demoIncidents.map((incident): TimelineEntry => ({
      id: incident.id,
      dateTime: incident.whenDidItHappen,
      signalType: "incident",
      severity: incident.status === "shared" ? "high" : "medium",
      source: "incident" as const,
      confidence: 88,
      notes: incident.whatHappened,
      suggestedNextAction: incident.followUpNeeded,
      reviewedByGuardian: incident.reviewedByGuardian,
      relatedLabel: incident.whereDidItHappen,
    })),
  ].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const auditLogs: AuditLog[] = [
    {
      id: makeId("audit"),
      childProfileId: demoChildId,
      userId: demoUser.id,
      action: "view_dashboard",
      targetType: "dashboard",
      targetId: demoChildId,
      severity: "info",
      details: { app: APP_NAME },
      ipAddress: null,
      userAgent: null,
      createdAt: nowMinus(2),
    },
    {
      id: makeId("audit"),
      childProfileId: demoChildId,
      userId: demoUser.id,
      action: "export_report",
      targetType: "report",
      targetId: "demo-report",
      severity: "notice",
      details: { format: "pdf" },
      ipAddress: null,
      userAgent: null,
      createdAt: nowMinus(1),
    },
  ];

  const consentRecords: ConsentRecord[] = [
    {
      id: makeId("consent"),
      userId: demoUser.id,
      childProfileId: demoChildId,
      consentType: "PRIVACY_RULES",
      accepted: true,
      legalResponsibleConfirmed: true,
      privacyRulesAccepted: true,
      version: "2026-06",
      grantedAt: nowMinus(1200),
      ipAddress: null,
      userAgent: null,
    },
  ];

  const report: Report = {
    id: makeId("report"),
    childProfileId: demoChildId,
    createdById: demoUser.id,
    title: `${DEMO_CHILD_NAME} wellbeing summary`,
    summary: patternSummary(patterns),
    riskBand: risk.band,
    riskScore: risk.score,
    timeline,
    patterns,
    guardianNotes: demoChild.wellbeingNotes ?? "",
    attachedIncidentIds: demoIncidents.map((incident) => incident.id),
    recommendedQuestions: [
      "What changed around sleep, feeding, or routine before the distress spike?",
      "Which notes would help a pediatrician or therapist understand the pattern more clearly?",
      "Are there any follow-up observations that should be captured in the next 72 hours?",
    ],
    disclaimer: LEGAL_DISCLAIMER,
    format: "pdf",
    generatedAt: nowMinus(1),
  };

  const exportRequests: ExportRequest[] = [
    {
      id: makeId("export"),
      userId: demoUser.id,
      childProfileId: demoChildId,
      reportId: report.id,
      format: "pdf",
      status: "ready",
      requestedReason: "Demo report export",
      requestedAt: nowMinus(1),
      completedAt: nowMinus(1),
      downloadToken: makeId("token"),
    },
  ];

  return {
    user: demoUser,
    child: demoChild,
    permissions: ROLE_PERMISSIONS.PRIMARY_GUARDIAN,
    roles: demoRoles,
    contacts: demoContacts,
    locations: demoLocations,
    sensorEvents: demoSensorEvents,
    audioSignalEvents: demoAudioEvents,
    incidents: demoIncidents,
    riskScores: [riskScore],
    alerts,
    reports: [report],
    auditLogs,
    consentRecords,
    exportRequests,
    timeline,
    patterns,
    stats: {
      currentStatus: "Needs attention",
      riskBand: risk.band,
      riskScore: risk.score,
      confidence: risk.confidence,
      last24hSummary:
        "Two distress-linked incidents, one prolonged crying window, and one silence anomaly were captured in the last day.",
      recentAlerts: alerts.length,
      activePatterns: patterns.length,
      incidentsTracked: demoIncidents.length,
      cryingTrend: [10, 12, 18, 11, 24, 27, 19],
      moodTrend: [72, 69, 61, 58, 54, 55, 51],
      sleepTrend: [8, 7, 6, 4, 4, 3, 5],
    },
    recentSummary: {
      cryDurationMinutes: 18,
      noiseAlerts: 2,
      missedResponses: 1,
      wellbeingNotes: [
        "Sleep shortened after a transition.",
        "Mood looked quieter than baseline.",
        "No raw audio is stored by default.",
      ],
    },
    safeMode: {
      monitorModeEnabled: true,
      audioModeEnabled: true,
      audioModeMuted: false,
      monitoringIndicator: "Visible listening indicator on",
    },
  };
}

export function createDemoWorkspace() {
  return buildWorkspace();
}

export function createEmptyWorkspace(): WorkspaceData {
  return {
    user: {
      id: "",
      name: "",
      email: "",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    child: null,
    permissions: ROLE_PERMISSIONS.EMERGENCY_CONTACT,
    roles: [],
    contacts: [],
    locations: [],
    sensorEvents: [],
    audioSignalEvents: [],
    incidents: [],
    riskScores: [],
    alerts: [],
    reports: [],
    auditLogs: [],
    consentRecords: [],
    exportRequests: [],
    timeline: [],
    patterns: [],
    stats: {
      currentStatus: "No child profile yet",
      riskBand: "Low",
      riskScore: 0,
      confidence: 0,
      last24hSummary: "No events yet.",
      recentAlerts: 0,
      activePatterns: 0,
      incidentsTracked: 0,
      cryingTrend: [0, 0, 0, 0, 0, 0, 0],
      moodTrend: [0, 0, 0, 0, 0, 0, 0],
      sleepTrend: [0, 0, 0, 0, 0, 0, 0],
    },
    recentSummary: {
      cryDurationMinutes: 0,
      noiseAlerts: 0,
      missedResponses: 0,
      wellbeingNotes: [],
    },
    safeMode: {
      monitorModeEnabled: false,
      audioModeEnabled: false,
      audioModeMuted: false,
      monitoringIndicator: "Monitoring is inactive",
    },
  };
}