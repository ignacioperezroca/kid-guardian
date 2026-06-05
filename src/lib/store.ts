    }
    return user;
  },
  async getWorkspace(userId) {
    const state = await getState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    return buildWorkspaceFromState(state, user);
  },
  async upsertChildProfile(userId, input) {
    const state = await getState();
    const now = nowIso();
    let child = state.childProfiles.find((item) => item.createdById === userId) ?? null;
    if (!child) {
      child = createDefaultChild({ userId, ...input });
      state.childProfiles.unshift(child);
      state.guardianRoles.unshift({
        id: uniqueId("role"),
        userId,
        childProfileId: child.id,
        role: "PRIMARY_GUARDIAN",
        permissions: ROLE_PERMISSIONS.PRIMARY_GUARDIAN,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      child.name = input.name;
      child.ageMonths = input.ageMonths;
      child.developmentStage = input.developmentStage;
      child.knownConditions = input.knownConditions;
      child.wellbeingNotes = input.wellbeingNotes || null;
      child.emergencyContacts = input.emergencyContacts;
      child.pediatricianContact = input.pediatricianContact || null;
      child.updatedAt = now;
    }
    syncContactsAndLocations(state, child.id, {
      trustedCaregivers: input.trustedCaregivers,
      regularLocations: input.regularLocations,
    });
    recalculateRisk(state, child.id);
    recalculateAlerts(state, child.id);
    await persistState(state);
    return hydrateChild(state, child);
  },
  async createIncident(userId, input) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    if (!child) throw new Error("CHILD_NOT_FOUND");
    const now = nowIso();
    const incident: Incident = {
      id: input.id ?? uniqueId("incident"),
      childProfileId: child.id,
      createdById: userId,
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
      notes: input.notes || null,
      reviewedByGuardian: input.reviewedByGuardian,
      savedClipLabel: input.savedClipLabel || null,
      createdAt: now,
      updatedAt: now,
    };
    state.incidents.unshift(incident);
    recalculateRisk(state, child.id);
    recalculateAlerts(state, child.id);
    await persistState(state);
    return incident;
  },
  async updateIncident(userId, incidentId, input) {
    const state = await getState();
    const incident = state.incidents.find((item) => item.id === incidentId);
    if (!incident) throw new Error("INCIDENT_NOT_FOUND");
    incident.status = input.status;
    incident.whatHappened = input.whatHappened;
    incident.whoWasPresent = input.whoWasPresent;
    incident.whereDidItHappen = input.whereDidItHappen;
    incident.whenDidItHappen = input.whenDidItHappen;
    incident.whatDidChildSayOrDo = input.whatDidChildSayOrDo;
    incident.physicalSigns = input.physicalSigns;
    incident.emotionalSigns = input.emotionalSigns;
    incident.evidenceAttached = input.evidenceAttached;
    incident.followUpNeeded = input.followUpNeeded;
    incident.notes = input.notes || null;
    incident.reviewedByGuardian = input.reviewedByGuardian;
    incident.savedClipLabel = input.savedClipLabel || null;
    incident.updatedAt = nowIso();
    const child = state.childProfiles.find((item) => item.id === incident.childProfileId);
    if (child) {
      recalculateRisk(state, child.id);
      recalculateAlerts(state, child.id);
    }
    await persistState(state);
    return incident;
  },
  async createMockSafetyEvents(userId, scenario) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    if (!child) throw new Error("CHILD_NOT_FOUND");
    const now = Date.now();
    const pushSensor = (event: Omit<SensorEvent, "id" | "createdAt">) => {
      state.sensorEvents.unshift({
        ...event,
        id: uniqueId("sensor"),
        createdAt: nowIso(),
      });
    };
    const pushAudio = (event: Omit<AudioSignalEvent, "id" | "createdAt">) => {
      state.audioSignalEvents.unshift({
        ...event,
        id: uniqueId("audio"),
        createdAt: nowIso(),
      });
    };
    const pushIncident = (
      event: Omit<Incident, "id" | "createdAt" | "updatedAt" | "createdById">
    ) => {
      state.incidents.unshift({
        ...event,
        createdById: userId,
        id: uniqueId("incident"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    };
    const base = {
      childProfileId: child.id,
      reviewedByGuardian: false,
    } as const;
    const twoMinutes = (minutes: number) => new Date(now - minutes * 60000).toISOString();

    if (scenario === "crying_spike" || scenario === "mixed") {
      pushSensor({
        ...base,
        eventType: "crying",
        source: "audio",
        severity: "high",
        confidence: 92,
        occurredAt: twoMinutes(12),
        durationSeconds: 19 * 60,
        notes: "Sustained crying in a bedtime transition window.",
        location: "Home",
        contact: child.name,
      });
    }
    if (scenario === "noise_burst" || scenario === "mixed") {
      pushAudio({
        ...base,
        signalType: "glass",
        severity: "high",
        confidence: 87,
        occurredAt: twoMinutes(18),
        windowSeconds: 16,
        localOnly: true,
        summary: "A loud impact or glass-like sound was detected locally.",
        transcriptExcerpt: null,
        rawAudioSaved: false,
        savedClipLabel: null,
      });
    }
    if (scenario === "silence_anomaly" || scenario === "mixed") {
      pushAudio({
        ...base,
        signalType: "silence_anomaly",
        severity: "medium",
        confidence: 70,
        occurredAt: twoMinutes(6),
        windowSeconds: 42,
        localOnly: true,
        summary: "A silence anomaly appeared during an expected active period.",
        transcriptExcerpt: null,
        rawAudioSaved: false,
        savedClipLabel: null,
      });
    }
    if (scenario === "caregiver_delay" || scenario === "mixed") {
      pushSensor({
        ...base,
        eventType: "caregiver_delay",
        source: "sensor",
        severity: "medium",
        confidence: 80,
        occurredAt: twoMinutes(26),
        durationSeconds: 9 * 60,
        notes: "Caregiver response delay after a noisy transition.",
        location: "Weekend caregiver home",
        contact: "Weekend caregiver",
      });
    }
    if (scenario === "distress_sequence" || scenario === "mixed") {
      pushSensor({
        ...base,
        eventType: "mood",
        source: "manual",
        severity: "medium",
        confidence: 76,
        occurredAt: twoMinutes(32),
        durationSeconds: undefined,
        notes: "Mood was withdrawn and anxious after a recurring visit context.",
        location: "Weekend caregiver home",
        contact: "Weekend caregiver",
      });
      pushIncident({
        ...base,
        status: "open",
        whatHappened: "The child became noticeably quiet and more withdrawn after a transition.",
        whoWasPresent: ["Weekend caregiver", "Alex Rivera"],
        whereDidItHappen: "Weekend caregiver home",
        whenDidItHappen: twoMinutes(30),
        whatDidChildSayOrDo: "Said 'no' and moved away from the room.",
        physicalSigns: "No visible injury noted.",
        emotionalSigns: "Anxious, tense, and tired.",
        evidenceAttached: false,
        followUpNeeded: "Compare sleep, appetite, and mood notes over the next few days.",
        notes: "Stored as a neutral incident summary.",
        reviewedByGuardian: false,
        savedClipLabel: null,
      });
    }

    recalculateRisk(state, child.id);
    recalculateAlerts(state, child.id);
    await persistState(state);
  },
  async updateMonitorSettings(userId, input) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    if (!child) return null;
    child.monitorModeEnabled = input.monitorModeEnabled;
    child.audioModeEnabled = input.audioModeEnabled;
    child.audioModeMuted = input.audioModeMuted;
    child.monitorListening = input.monitorModeEnabled && input.audioModeEnabled && !input.audioModeMuted;
    child.updatedAt = nowIso();
    if (input.saveIncidentClip && input.clipWarningAccepted) {
      state.audioSignalEvents.unshift({
        id: uniqueId("audio"),
        childProfileId: child.id,
        signalType: "note",
        severity: "medium",
        confidence: 74,
        occurredAt: nowIso(),
        windowSeconds: 20,
        localOnly: true,
        summary: "A short clip summary was explicitly saved as an incident record.",
        transcriptExcerpt: input.savedClipLabel || "Guardian-confirmed clip excerpt",
        rawAudioSaved: true,
        savedClipLabel: input.savedClipLabel || "Saved clip",
        reviewedByGuardian: true,
        createdAt: nowIso(),
      });
    }
    recalculateRisk(state, child.id);
    recalculateAlerts(state, child.id);
    await persistState(state);
    return hydrateChild(state, child);
  },
  async dismissAlert(userId, alertId, note) {
    const state = await getState();
    const alert = state.alerts.find((item) => item.id === alertId);
    if (!alert) return null;
    alert.status = "dismissed" as AlertStatus;
    alert.reviewedByGuardian = true;
    alert.updatedAt = nowIso();
    if (note) {
      alert.reason = `${alert.reason} | Review note: ${note}`;
    }
    await persistState(state);
    return alert;
  },
  async escalateAlert(userId, alertId, note) {
    const state = await getState();
    const alert = state.alerts.find((item) => item.id === alertId);
    if (!alert) return null;
    alert.status = "escalated" as AlertStatus;
    alert.reviewedByGuardian = true;
    alert.updatedAt = nowIso();
    if (note) {
      alert.reason = `${alert.reason} | Escalation note: ${note}`;
    }
    await persistState(state);
    return alert;
  },
  async markAlertIncident(userId, alertId) {
    const state = await getState();
    const alert = state.alerts.find((item) => item.id === alertId);
    const child = alert ? state.childProfiles.find((item) => item.id === alert.childProfileId) : null;
    if (!alert || !child) return null;
    const incident = await demoStore.createIncident(userId, {
      status: "open",
      whatHappened: alert.reason,
      whoWasPresent: [],
      whereDidItHappen: alert.sourceLabel,
      whenDidItHappen: nowIso(),
      whatDidChildSayOrDo: alert.suggestedAction,
      physicalSigns: "Not recorded yet.",
      emotionalSigns: "Not recorded yet.",
      evidenceAttached: false,
      followUpNeeded: "Review this alert with structured notes.",
      notes: `Created from alert: ${alert.sourceLabel}`,
      reviewedByGuardian: false,
      savedClipLabel: null,
    });
    return incident;
  },
  async createReport(userId, input) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    if (!child) return null;
    const report = recalculateReport(
      state,
      child.id,
      userId,
      "pdf",
      input.guardianNotes || child.wellbeingNotes || "",
      input.includeIncidents,
      input.title
    );
    await persistState(state);
    return report;
  },
  async requestExport(userId, reportId, format, reason) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    if (!child) return null;
    const exportRequest: ExportRequest = {
      id: uniqueId("export"),
      userId,
      childProfileId: child.id,
      reportId,
      format,
      status: "ready",
      requestedReason: reason || null,
      requestedAt: nowIso(),
      completedAt: nowIso(),
      downloadToken: uniqueId("token"),
    };
    state.exportRequests.unshift(exportRequest);
    await persistState(state);
    return exportRequest;
  },
  async listAuditLogs(userId, limit) {
    const state = await getState();
    return state.auditLogs
      .filter((event) => event.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  async recordAudit(entry) {
    const state = await getState();
    const audit = logAuditInternal(state, entry);
    await persistState(state);
    return audit;
  },
  async recordConsent(input) {
    const state = await getState();
    const consent: ConsentRecord = {
      ...input,
      id: uniqueId("consent"),
      grantedAt: nowIso(),
    };
    state.consentRecords.unshift(consent);
    await persistState(state);
    return consent;
  },
  async deleteWorkspace(userId) {
    const state = await getState();
    const child = getPrimaryChild(state, userId);
    const childId = child?.id ?? null;

    if (childId) {
      state.childProfiles = state.childProfiles.filter((item) => item.id !== childId);
      state.guardianRoles = state.guardianRoles.filter(
        (item) => item.childProfileId !== childId
      );
      state.trustedContacts = state.trustedContacts.filter(
        (item) => item.childProfileId !== childId
      );
      state.locations = state.locations.filter((item) => item.childProfileId !== childId);
      state.sensorEvents = state.sensorEvents.filter((item) => item.childProfileId !== childId);
      state.audioSignalEvents = state.audioSignalEvents.filter(
        (item) => item.childProfileId !== childId
      );
      state.incidents = state.incidents.filter((item) => item.childProfileId !== childId);
      state.riskScores = state.riskScores.filter((item) => item.childProfileId !== childId);
      state.alerts = state.alerts.filter((item) => item.childProfileId !== childId);
      state.reports = state.reports.filter((item) => item.childProfileId !== childId);
      state.exportRequests = state.exportRequests.filter(
        (item) => item.childProfileId !== childId
      );
      state.consentRecords = state.consentRecords.filter(
        (item) => item.childProfileId !== childId
      );
      state.auditLogs = state.auditLogs.filter((item) => item.childProfileId !== childId);
    }

    state.auditLogs.unshift({
      id: uniqueId("audit"),
      userId,
      childProfileId: null,
      action: "delete_workspace",
      targetType: "workspace",
      targetId: childId,
      severity: "critical",
      details: { childId, deletedAt: nowIso() },
      ipAddress: null,
      userAgent: null,
      createdAt: nowIso(),
    });

    await persistState(state);
    return { childId };
  },
};