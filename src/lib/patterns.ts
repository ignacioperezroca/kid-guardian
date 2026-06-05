import type { AudioSignalEvent, Incident, PatternMatch, SensorEvent } from "./types";
import { formatRelativeTime } from "./format";

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function buildPattern(
  title: string,
  summary: string,
  confidence: number,
  evidenceCount: number,
  contextLabel: string,
  recommendedAction: string,
  signals: string[],
  lastObservedAt: string
): PatternMatch {
  return {
    id: `${title}-${contextLabel}`.replace(/\s+/g, "-").toLowerCase(),
    title,
    summary,
    confidence,
    evidenceCount,
    contextLabel,
    recommendedAction,
    signals,
    lastObservedAt,
  };
}

export function detectPatterns(input: {
  incidents: Incident[];
  sensorEvents: SensorEvent[];
  audioEvents: AudioSignalEvent[];
}) {
  const patterns: PatternMatch[] = [];
  const incidentText = [...input.incidents]
    .map((incident) =>
      [
        incident.whatHappened,
        incident.whatDidChildSayOrDo,
        incident.physicalSigns,
        incident.emotionalSigns,
        incident.followUpNeeded,
        incident.notes,
        incident.whereDidItHappen,
      ]
        .join(" ")
        .toLowerCase()
    )
    .join(" | ");

  const locations = new Map<string, Incident[]>();
  for (const incident of input.incidents) {
    const key = normalize(incident.whereDidItHappen);
    if (!key) continue;
    const existing = locations.get(key) ?? [];
    existing.push(incident);
    locations.set(key, existing);
  }

  for (const [location, incidents] of locations.entries()) {
    if (incidents.length >= 2) {
      const recent = incidents.sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
      )[0];

      patterns.push(
        buildPattern(
          "Repeated distress after the same location",
          `There are ${incidents.length} linked incidents or notes associated with ${location}. This may be worth documenting in more detail and discussing with a professional.`,
          Math.min(96, 48 + incidents.length * 12),
          incidents.length,
          location,
          "Keep logging what happens before and after visits, including sleep, appetite, tone, and any physical or emotional changes.",
          incidents.map((incident) => incident.whatHappened),
          recent.updatedAt ?? recent.createdAt
        )
      );
    }
  }

  const fearRelated = input.incidents.filter((incident) => {
    const text = [
      incident.whatHappened,
      incident.whatDidChildSayOrDo,
      incident.physicalSigns,
      incident.emotionalSigns,
      incident.notes,
    ]
      .join(" ")
      .toLowerCase();
    return /fear|afraid|scared|panic|unsafe|threat|violence/.test(text);
  });

  if (fearRelated.length >= 2) {
    const recent = fearRelated.sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )[0];

    patterns.push(
      buildPattern(
        "Repeated fear or safety concern language",
        "The child-related notes contain repeated fear, threat, or safety language. Keep the wording factual and consider professional follow-up.",
        Math.min(94, 56 + fearRelated.length * 10),
        fearRelated.length,
        "safety language",
        "Ask a pediatrician, therapist, or school counselor which observations would be most useful to document next.",
        fearRelated.map((incident) => incident.whatDidChildSayOrDo || incident.whatHappened),
        recent.updatedAt ?? recent.createdAt
      )
    );
  }

  const sleepSignals = [...input.sensorEvents, ...input.audioEvents].filter((event) => {
    const text = "eventType" in event ? event.eventType : event.signalType;
    return /sleep|silence|night|bedtime|rest/.test(text.toLowerCase());
  });

  const weekdayGroups = new Map<string, number>();
  for (const event of sleepSignals) {
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      new Date(event.occurredAt)
    );
    weekdayGroups.set(weekday, (weekdayGroups.get(weekday) ?? 0) + 1);
  }
  const repeatedWeekday = [...weekdayGroups.entries()].find(([, count]) => count >= 2);
  if (repeatedWeekday) {
    patterns.push(
      buildPattern(
        "Sleep disruption on a recurring day",
        `Sleep-related signals cluster on ${repeatedWeekday[0]}. This can be useful context when comparing school days, visits, travel, or routine changes.`,
        Math.min(92, 50 + repeatedWeekday[1] * 12),
        repeatedWeekday[1],
        repeatedWeekday[0],
        "Compare sleep notes with the surrounding schedule and watch for repeated changes in routine, transitions, or caregiving context.",
        sleepSignals.slice(0, 4).map((event) =>
          "eventType" in event ? event.eventType : event.signalType
        ),
        sleepSignals[sleepSignals.length - 1]?.occurredAt ?? new Date().toISOString()
      )
    );
  }

  const violenceSignals = [...input.audioEvents].filter((event) =>
    /glass|impact|shout|scream|aggressive|help|urgent/.test(event.signalType.toLowerCase())
  );
  if (violenceSignals.length >= 2) {
    patterns.push(
      buildPattern(
        "Repeated high-intensity audio signals",
        "Audio summaries include repeated loud or distressing signals. Because KidGuardian does not store raw audio by default, use structured notes to capture the surrounding context.",
        Math.min(90, 50 + violenceSignals.length * 9),
        violenceSignals.length,
        "audio signals",
        "If these signals recur, add exact timestamps and consider sharing the summary with a professional reviewer.",
        violenceSignals.map((event) => event.signalType),
        violenceSignals[violenceSignals.length - 1]?.occurredAt ?? new Date().toISOString()
      )
    );
  }

  const anxietySignals = [...input.sensorEvents].filter((event) => /cry|distress|mood|anxious|withdraw|regression/.test(event.eventType.toLowerCase()) || /cry|distress|anxious|withdraw|regression/.test(event.notes.toLowerCase()));
  if (anxietySignals.length >= 3) {
    patterns.push(
      buildPattern(
        "Increased crying or anxiety pattern",
        "There are repeated emotional or crying-related signals that could justify closer documentation of timing, transitions, and related routines.",
        Math.min(91, 44 + anxietySignals.length * 10),
        anxietySignals.length,
        "crying / anxiety",
        "Track what changed before the spike, and note sleep, appetite, and caregiver transitions for the next few days.",
        anxietySignals.map((event) => event.eventType),
        anxietySignals[anxietySignals.length - 1]?.occurredAt ?? new Date().toISOString()
      )
    );
  }

  if (!patterns.length && incidentText.trim()) {
    patterns.push(
      buildPattern(
        "No repeated pattern yet",
        "There is not enough repeated context to identify a trend. Keep documenting observations with dates, places, and who was present.",
        18,
        1,
        "insufficient repetition",
        "Continue transparent monitoring and revisit after more observations accumulate.",
        ["initial observations"],
        new Date().toISOString()
      )
    );
  }

  return patterns.sort(
    (a, b) =>
      new Date(b.lastObservedAt).getTime() - new Date(a.lastObservedAt).getTime()
  );
}

export function patternSummary(patterns: PatternMatch[]) {
  if (!patterns.length) {
    return "No repeated patterns have been identified yet.";
  }

  const top = patterns.slice(0, 2);
  return top
    .map(
      (pattern) =>
        `${pattern.title}: ${pattern.summary} (${pattern.evidenceCount} signals, ${formatRelativeTime(pattern.lastObservedAt)})`
    )
    .join(" ");
}
