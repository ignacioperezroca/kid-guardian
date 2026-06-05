import { describe, expect, it } from "vitest";
import { calculateRiskScore } from "./risk";
import type { AudioSignalEvent, Incident, SensorEvent } from "./types";

const childId = "child-demo";
const guardianId = "guardian-demo";

function stamp(hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 5, 4, hour, minute, 0)).toISOString();
}

function makeSensorEvent(
  index: number,
  overrides: Partial<SensorEvent> = {}
): SensorEvent {
  return {
    id: `sensor-${index}`,
    childProfileId: childId,
    eventType: "crying",
    source: "audio",
    severity: "medium",
    confidence: 72,
    occurredAt: stamp(12, index),
    durationSeconds: 180,
    notes: "Routine observation",
    location: "Home",
    contact: "Primary guardian",
    reviewedByGuardian: false,
    createdAt: stamp(12, index),
    ...overrides,
  };
}

function makeAudioEvent(
  index: number,
  overrides: Partial<AudioSignalEvent> = {}
): AudioSignalEvent {
  return {
    id: `audio-${index}`,
    childProfileId: childId,
    signalType: "shouting",
    severity: "high",
    confidence: 84,
    occurredAt: stamp(2, index),
    windowSeconds: 20,
    localOnly: true,
    summary: "Local-only audio summary",
    transcriptExcerpt: null,
    rawAudioSaved: false,
    savedClipLabel: null,
    reviewedByGuardian: false,
    createdAt: stamp(2, index),
    ...overrides,
  };
}

function makeIncident(
  index: number,
  overrides: Partial<Incident> = {}
): Incident {
  return {
    id: `incident-${index}`,
    childProfileId: childId,
    createdById: guardianId,
    status: "open",
    whatHappened: "Structured incident note",
    whoWasPresent: ["Primary guardian"],
    whereDidItHappen: "Home",
    whenDidItHappen: stamp(2, index + 10),
    whatDidChildSayOrDo: "Said help and moved away",
    physicalSigns: "No visible injury noted",
    emotionalSigns: "Fearful and tense",
    evidenceAttached: false,
    followUpNeeded: "Continue documenting and review with a professional.",
    notes: "Incident log entry",
    reviewedByGuardian: false,
    savedClipLabel: null,
    createdAt: stamp(2, index + 10),
    updatedAt: stamp(2, index + 10),
    ...overrides,
  };
}

describe("calculateRiskScore", () => {
  it("returns a low score with no signals", () => {
    const result = calculateRiskScore({
      events: [],
      audioEvents: [],
      incidents: [],
      guardianNotes: "",
    });

    expect(result.score).toBe(0);
    expect(result.band).toBe("Low");
    expect(result.summary).toContain("does not diagnose abuse");
    expect(result.recommendation).toContain("monitor");
  });

  it("elevates recurring context into the watch band", () => {
    const result = calculateRiskScore({
      events: [
        makeSensorEvent(1, {
          eventType: "crying",
          severity: "medium",
          location: "Weekday caregiver home",
          contact: "Weekend caregiver",
        }),
        makeSensorEvent(2, {
          eventType: "crying",
          severity: "medium",
          location: "Weekday caregiver home",
          contact: "Weekend caregiver",
        }),
        makeSensorEvent(3, {
          eventType: "crying",
          severity: "medium",
          location: "Weekday caregiver home",
          contact: "Weekend caregiver",
        }),
      ],
      audioEvents: [],
      incidents: [],
      guardianNotes: "",
    });

    expect(result.score).toBeGreaterThan(25);
    expect(result.band).toBe("Watch");
    expect(result.factors.find((factor) => factor.title === "Recurrence")?.value).toBeGreaterThan(0);
  });

  it("escalates a repeated high-risk pattern to urgent", () => {
    const result = calculateRiskScore({
      events: [
        makeSensorEvent(1, {
          eventType: "crying",
          severity: "high",
          notes: "Sustained crying with fear and distress.",
          location: "Home",
          contact: "Weekend caregiver",
          occurredAt: stamp(2, 1),
        }),
        makeSensorEvent(2, {
          eventType: "distress",
          severity: "high",
          notes: "Child appeared anxious and withdrawn.",
          location: "Home",
          contact: "Weekend caregiver",
          occurredAt: stamp(2, 2),
        }),
        makeSensorEvent(3, {
          eventType: "mood",
          severity: "high",
          notes: "Mood shifted to fearful and tense.",
          location: "Home",
          contact: "Weekend caregiver",
          occurredAt: stamp(2, 3),
        }),
        makeSensorEvent(4, {
          eventType: "caregiver_delay",
          severity: "high",
          notes: "Response delay after a loud transition.",
          location: "Home",
          contact: "Weekend caregiver",
          occurredAt: stamp(2, 4),
        }),
      ],
      audioEvents: [
        makeAudioEvent(1, {
          signalType: "shouting",
          severity: "high",
          summary: "Repeated shouting detected locally.",
          rawAudioSaved: true,
          savedClipLabel: "hallway",
          transcriptExcerpt: "help",
          occurredAt: stamp(2, 5),
        }),
        makeAudioEvent(2, {
          signalType: "glass",
          severity: "critical",
          summary: "Loud impact or glass-like sound detected locally.",
          rawAudioSaved: true,
          savedClipLabel: "kitchen",
          transcriptExcerpt: "stop",
          occurredAt: stamp(2, 6),
        }),
      ],
      incidents: [
        makeIncident(1, {
          status: "open",
          whatHappened: "The child became noticeably withdrawn after the visit.",
          emotionalSigns: "Fearful, tense, and quiet.",
          whereDidItHappen: "Home",
        }),
        makeIncident(2, {
          status: "shared",
          whatHappened: "Caregiver noted a repeated distress spike after the same context.",
          emotionalSigns: "Anxious and worried.",
          whereDidItHappen: "Home",
        }),
      ],
      guardianNotes: "afraid unsafe threat violence distress",
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.band).toBe("Urgent");
    expect(result.recommendation).toContain("emergency services");
  });
});
