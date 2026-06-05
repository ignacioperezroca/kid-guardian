import type {
  Alert,
  AudioSignalEvent,
  Incident,
  AlertSeverity,
  SensorEvent,
  TimelineSource,
} from "./types";

function severityRank(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

function makeAlert(input: {
  childProfileId: string;
  severity: AlertSeverity;
  reason: string;
  confidence: number;
  suggestedAction: string;
  source: TimelineSource;
  sourceLabel: string;
  relatedId?: string | null;
}): Alert {
  const now = new Date().toISOString();
  return {
    id: `${input.childProfileId}-${input.sourceLabel}-${Math.random().toString(36).slice(2, 8)}`,
    childProfileId: input.childProfileId,
    severity: input.severity,
    reason: input.reason,
    confidence: input.confidence,
    suggestedAction: input.suggestedAction,
    status: "open",
    source: input.source,
    sourceLabel: input.sourceLabel,
    relatedId: input.relatedId ?? null,
    createdAt: now,
    updatedAt: now,
    reviewedByGuardian: false,
  };
}

export function deriveAlerts(input: {
  childProfileId: string;
  events: SensorEvent[];
  audioEvents: AudioSignalEvent[];
  incidents: Incident[];
  monitorAudioEnabled: boolean;
}) {
  const alerts: Alert[] = [];
  const recentEvents = input.events.slice(-20);
  const recentAudio = input.audioEvents.slice(-20);
  const recentIncidents = input.incidents.slice(-10);

  const cryingSignals = recentEvents.filter(
    (event) => /cry|distress/.test(event.eventType.toLowerCase()) && (event.durationSeconds ?? 0) >= 10 * 60
  );
  const totalCryingMinutes = cryingSignals.reduce(
    (sum, event) => sum + (event.durationSeconds ?? 0) / 60,
    0
  );
  if (cryingSignals.length || totalCryingMinutes >= 20) {
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: totalCryingMinutes >= 35 ? "high" : "medium",
        reason:
          totalCryingMinutes >= 35
            ? "Prolonged crying was observed more than once in the current monitoring window."
            : "Crying duration crossed the monitoring threshold.",
        confidence: Math.min(95, 64 + cryingSignals.length * 8),
        suggestedAction:
          "Review the last 24 hours of notes, check for sleep or feeding changes, and add an incident if context is concerning.",
        source: "sensor",
        sourceLabel: "Prolonged crying",
        relatedId: cryingSignals[0]?.id ?? null,
      })
    );
  }

  const loudNoise = recentAudio.find((event) =>
    /glass|impact|shout|scream|aggressive|noise/.test(event.signalType.toLowerCase())
  );
  if (loudNoise) {
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: severityRank(loudNoise.severity) >= 3 ? "high" : "medium",
        reason: `A loud or distressing audio signal was classified as ${loudNoise.signalType.replace(/_/g, " ")}.`,
        confidence: loudNoise.confidence,
        suggestedAction:
          "Add the surrounding context, note who was present, and save a clip only if it is necessary and explicitly confirmed.",
        source: "audio",
        sourceLabel: "Violent or loud sound",
        relatedId: loudNoise.id,
      })
    );
  }

  const urgentKeyword = recentAudio.find((event) => event.signalType === "urgent_keyword");
  if (input.monitorAudioEnabled && urgentKeyword) {
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: "critical",
        reason: "An urgent safety keyword was detected while guardian-enabled audio mode was active.",
        confidence: urgentKeyword.confidence,
        suggestedAction:
          "If the child may be in immediate danger, contact emergency services or the appropriate child protection authority now.",
        source: "audio",
        sourceLabel: "Urgent safety keyword",
        relatedId: urgentKeyword.id,
      })
    );
  }

  const repeatedContext = new Map<string, Incident[]>();
  for (const incident of recentIncidents) {
    const key = `${incident.whereDidItHappen}`.trim().toLowerCase();
    if (!key) continue;
    repeatedContext.set(key, [...(repeatedContext.get(key) ?? []), incident]);
  }
  const repeatedEntry = [...repeatedContext.entries()].find(([, incidents]) => incidents.length >= 2);
  if (repeatedEntry) {
    const [location, incidents] = repeatedEntry;
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: incidents.length >= 4 ? "high" : "medium",
        reason: `Multiple incidents or notes are associated with ${location}.`,
        confidence: Math.min(92, 58 + incidents.length * 8),
        suggestedAction:
          "Review the timeline for the repeated context and consider whether a professional should review the pattern.",
        source: "incident",
        sourceLabel: "Repeated context",
        relatedId: incidents[0]?.id ?? null,
      })
    );
  }

  const concerningPhrase = recentAudio.find(
    (event) =>
      event.rawAudioSaved &&
      event.transcriptExcerpt &&
      /help|stop|hurt|scared|unsafe|don'?t|no/i.test(event.transcriptExcerpt)
  );
  if (concerningPhrase) {
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: "high",
        reason: "A guardian-saved clip includes a concerning phrase.",
        confidence: concerningPhrase.confidence,
        suggestedAction:
          "Review the saved excerpt carefully, add a structured incident, and share only with appropriate professionals.",
        source: "audio",
        sourceLabel: "Concerning phrase",
        relatedId: concerningPhrase.id,
      })
    );
  }

  const delayedResponse = recentEvents.find((event) => event.eventType === "caregiver_delay");
  if (delayedResponse) {
    alerts.push(
      makeAlert({
        childProfileId: input.childProfileId,
        severity: "medium",
        reason: "A caregiver response delay exceeded the configured local threshold.",
        confidence: delayedResponse.confidence,
        suggestedAction:
          "Check whether the delay was situational or recurring, then note any patterns alongside the timeline.",
        source: "sensor",
        sourceLabel: "Caregiver delay",
        relatedId: delayedResponse.id,
      })
    );
  }

  return alerts.sort((a, b) => {
    const severityDiff = severityRank(b.severity) - severityRank(a.severity);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

