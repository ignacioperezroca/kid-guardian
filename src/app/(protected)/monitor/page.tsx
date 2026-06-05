import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { generateMockEventsAction, toggleMonitorAction } from "@/app/actions";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  PageShell,
  SectionTitle,
  TimelineCard,
} from "@/components/ui";

export default async function MonitorPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_monitor",
    targetType: "monitor",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { audioEnabled: workspace.safeMode.audioModeEnabled },
    ipAddress: null,
    userAgent: null,
  });

  const child = workspace.child;

  if (!child) {
    return (
      <PageShell>
        <SectionTitle
          eyebrow="Baby monitor mode"
          title="Create a child profile before activating monitor mode."
          description="The monitor uses visible, opt-in controls only. No hidden background listening, no raw audio storage by default."
          action={<Badge tone="neutral">Profile needed</Badge>}
        />
        <div className="mt-8">
          <EmptyState
            title="No active monitoring yet"
            description="Once you create the child profile, you can turn on visible monitoring, inspect local signal summaries, and decide whether to save a short incident clip."
          />
        </div>
      </PageShell>
    );
  }

  const audioSignals = workspace.audioSignalEvents.slice(0, 5);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Baby monitor mode"
        title="Visible, opt-in, local-first audio monitoring"
        description="The screen always shows whether audio mode is active, what was detected locally, and whether any short clip was explicitly saved as an incident record."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Live status</CardTitle>
            <CardDescription>Clear indicators make it obvious when monitoring is active.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={workspace.safeMode.monitorModeEnabled ? "success" : "neutral"}>
                Monitor {workspace.safeMode.monitorModeEnabled ? "on" : "off"}
              </Badge>
              <Badge tone={workspace.safeMode.audioModeEnabled ? "primary" : "neutral"}>
                Audio {workspace.safeMode.audioModeEnabled ? "enabled" : "disabled"}
              </Badge>
              <Badge tone={workspace.safeMode.audioModeMuted ? "warning" : "neutral"}>
                {workspace.safeMode.audioModeMuted ? "Muted" : "Listening visible"}
              </Badge>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-secondary)]/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                Recording indicator
              </p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                {child.monitorListening ? "Live signal analysis is active" : "Monitoring is paused"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {child.audioModeEnabled
                  ? "Local analysis runs on short windows and discards raw audio by default after classification."
                  : "Audio safety mode is off, so only manual notes and structured events are collected."}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Crying duration
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.recentSummary.cryDurationMinutes} min
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Noise alerts
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.recentSummary.noiseAlerts}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Response delays
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.recentSummary.missedResponses}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monitor controls</CardTitle>
            <CardDescription>Every action is explicit, visible, and guardian-controlled.</CardDescription>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-2">
            <form action={toggleMonitorAction} className="space-y-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-sm font-medium">Start / stop monitoring</p>
              <input type="hidden" name="savedClipLabel" value="" />
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="monitorModeEnabled" defaultChecked={child.monitorModeEnabled} />
                Monitor mode enabled
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="audioModeEnabled" defaultChecked={child.audioModeEnabled} />
                Audio safety mode enabled
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="audioModeMuted" defaultChecked={child.audioModeMuted} />
                Mute local audio analysis
              </label>
              <Button type="submit" variant="secondary" className="w-full">
                Update live monitoring
              </Button>
            </form>

            <form action={toggleMonitorAction} className="space-y-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-sm font-medium">Save a short incident clip</p>
              <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                Save only when you explicitly need a short excerpt. Raw audio is discarded by default.
              </p>
              <input type="hidden" name="monitorModeEnabled" value={String(child.monitorModeEnabled)} />
              <input type="hidden" name="audioModeEnabled" value={String(child.audioModeEnabled)} />
              <input type="hidden" name="audioModeMuted" value={String(child.audioModeMuted)} />
              <div className="space-y-2">
                <Label htmlFor="savedClipLabel">Clip label</Label>
                <Input
                  id="savedClipLabel"
                  name="savedClipLabel"
                  placeholder="Bedtime crying excerpt"
                />
              </div>
              <label className="flex items-start gap-3 rounded-2xl bg-[color:var(--color-warning)]/10 p-3 text-sm leading-6">
                <input
                  type="checkbox"
                  name="clipWarningAccepted"
                  className="mt-1 h-4 w-4"
                  required
                />
                <span>
                  I understand this clip is for responsible, guardian-only incident logging and must be used ethically and lawfully.
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="saveIncidentClip" defaultChecked />
                Save this short clip summary as an incident record
              </label>
              <Button type="submit" variant="primary" className="w-full">
                Save incident summary
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Local signal detection</CardTitle>
            <CardDescription>
              Short audio windows are summarized locally. Raw audio is not stored by default.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <form action={generateMockEventsAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="scenario" value="crying_spike" />
              <Button type="submit" variant="secondary" size="sm">
                Crying spike
              </Button>
            </form>
            <form action={generateMockEventsAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="scenario" value="noise_burst" />
              <Button type="submit" variant="secondary" size="sm">
                Noise burst
              </Button>
            </form>
            <form action={generateMockEventsAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="scenario" value="silence_anomaly" />
              <Button type="submit" variant="secondary" size="sm">
                Silence anomaly
              </Button>
            </form>

            <div className="space-y-3">
              {audioSignals.map((event) => (
                <div key={event.id} className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{event.signalType.replace(/_/g, " ")}</p>
                      <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
                        {formatDateTime(event.occurredAt)}
                      </p>
                    </div>
                    <Badge tone={event.severity}>{Math.round(event.confidence)}% confidence</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                    {event.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={event.rawAudioSaved ? "warning" : "neutral"}>
                      {event.rawAudioSaved ? "Clip saved" : "Summary only"}
                    </Badge>
                    <Badge tone="neutral">{event.windowSeconds} sec window</Badge>
                    <Badge tone="neutral">{event.localOnly ? "Local-first" : "Remote"}</Badge>
                  </div>
                </div>
              ))}
              {!audioSignals.length ? (
                <EmptyState
                  title="No local signal summaries yet"
                  description="Generate a mock safety event to see how local audio summaries and visible indicators appear."
                />
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring timeline</CardTitle>
            <CardDescription>Everything here is reviewed, logged, and intentionally brief.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            {workspace.timeline.slice(0, 4).map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
            {workspace.timeline.length ? null : (
              <EmptyState
                title="No monitoring events yet"
                description="Once the monitor is active or mock events are generated, the latest signals will appear here."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/6">
        <CardBody className="p-5">
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">
            Reminder: KidGuardian never stores continuous raw audio by default.
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            The only persistent audio artifact in this MVP is a guardian-confirmed short incident summary. That summary is always visible, auditable, and must be used responsibly.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
