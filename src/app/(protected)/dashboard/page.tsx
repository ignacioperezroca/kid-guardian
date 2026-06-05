import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { formatPercent, formatRiskBand } from "@/lib/format";
import { DEFAULT_REPORT_QUESTIONS, RISK_BAND_COPY } from "@/lib/constants";
import {
  AlertCard,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LinkButton,
  PageShell,
  ProgressBar,
  SectionTitle,
  StatCard,
  TimelineCard,
} from "@/components/ui";
import { generateMockEventsAction, alertAction } from "@/app/actions";

function TrendBars({ values, tone = "primary" }: { values: number[]; tone?: "primary" | "success" | "warning" | "danger" }) {
  const max = Math.max(...values, 1);
  const color =
    tone === "success"
      ? "bg-[color:var(--color-success)]"
      : tone === "warning"
        ? "bg-[color:var(--color-warning)]"
        : tone === "danger"
          ? "bg-[color:var(--color-danger)]"
          : "bg-[color:var(--color-primary)]";

  return (
    <div className="flex items-end gap-2">
      {values.map((value, index) => (
        <div key={`${index}-${value}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-[92px] w-full items-end rounded-full bg-[color:var(--color-secondary)]/45">
            <div
              className={`${color} mt-auto w-full rounded-full transition-all`}
              style={{ height: `${Math.max(8, (value / max) * 92)}px` }}
            />
          </div>
          <span className="text-[10px] text-[color:var(--color-muted-foreground)]">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_dashboard",
    targetType: "dashboard",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: {
      riskBand: workspace.stats.riskBand,
      riskScore: workspace.stats.riskScore,
    },
    ipAddress: null,
    userAgent: null,
  });

  if (!workspace.child) {
    return (
      <PageShell>
        <SectionTitle
          eyebrow="Safety dashboard"
          title="Create a child profile to begin monitoring."
          description="The workspace is ready, but the child profile comes first. After that, you can enable transparent monitoring, add trusted contacts, and start tracking wellbeing patterns."
          action={<LinkButton href="/child-profile">Create profile</LinkButton>}
        />
        <div className="mt-8">
          <EmptyState
            title="No child profile yet"
            description="Once you add the child profile, the dashboard will start showing wellbeing status, timeline entries, alerts, and report drafts."
            action={<LinkButton href="/child-profile">Set up profile</LinkButton>}
          />
        </div>
      </PageShell>
    );
  }

  const { child, stats, alerts, timeline, recentSummary, patterns, reports } = workspace;

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Safety dashboard"
        title={`${child.name} wellbeing status`}
        description="Transparent, decision-support monitoring with visible consent and audit trails."
        action={
          <form action={generateMockEventsAction}>
            <input type="hidden" name="scenario" value="mixed" />
            <Button type="submit" variant="secondary">
              Generate mock safety events
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current wellbeing"
          value={stats.currentStatus}
          detail={`${formatRiskBand(stats.riskBand)} risk · ${formatPercent(stats.confidence)} confidence`}
          tone={stats.riskBand === "Urgent" ? "danger" : stats.riskBand === "Concerning" ? "warning" : stats.riskBand === "Watch" ? "primary" : "success"}
        />
        <StatCard
          label="Risk score"
          value={`${Math.round(stats.riskScore)}/100`}
          detail={RISK_BAND_COPY[stats.riskBand]}
          tone={stats.riskBand === "Urgent" ? "danger" : stats.riskBand === "Concerning" ? "warning" : "primary"}
        />
        <StatCard
          label="Recent alerts"
          value={stats.recentAlerts}
          detail={workspace.alerts.length ? `Latest: ${workspace.alerts[0].reason}` : "No open alerts at the moment."}
          tone={workspace.alerts.length ? "warning" : "success"}
        />
        <StatCard
          label="Tracked incidents"
          value={stats.incidentsTracked}
          detail={reports.length ? "Professional report draft is ready." : "Use the incident log to structure observations."}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Last 24 hours</CardTitle>
                <CardDescription>{stats.last24hSummary}</CardDescription>
              </div>
              <Badge tone={stats.riskBand}>{formatRiskBand(stats.riskBand)}</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Crying
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {recentSummary.cryDurationMinutes} min
                </p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  Sustained crying windows in the last day
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Noise alerts
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {recentSummary.noiseAlerts}
                </p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  Loud or distressing signal classifications
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Caregiver delay
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {recentSummary.missedResponses}
                </p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  Response delays or silence anomalies
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-sm font-medium">Crying trend</p>
                <div className="mt-4">
                  <TrendBars values={stats.cryingTrend} tone="danger" />
                </div>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-sm font-medium">Mood trend</p>
                <div className="mt-4">
                  <TrendBars values={stats.moodTrend} tone="warning" />
                </div>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                <p className="text-sm font-medium">Sleep trend</p>
                <div className="mt-4">
                  <TrendBars values={stats.sleepTrend} tone="primary" />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-secondary)]/18 p-5">
              <p className="text-sm font-semibold">Recommended next actions</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {DEFAULT_REPORT_QUESTIONS.slice(0, 3).map((question) => (
                  <li key={question} className="rounded-2xl bg-white/65 px-3 py-2">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk score breakdown</CardTitle>
              <CardDescription>
                Decision-support only. Not a diagnosis, not legal proof, and not a final determination.
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <ProgressBar value={stats.riskScore} tone={stats.riskBand === "Urgent" ? "danger" : stats.riskBand === "Concerning" ? "warning" : "primary"} />
              <div className="space-y-3">
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {workspace.riskScores[0]?.summary}
                </p>
                {workspace.riskScores[0]?.factors.map((factor) => (
                  <div key={factor.title} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{factor.title}</p>
                      <Badge tone="neutral">{Math.round(factor.value)}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                      {factor.note}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pattern summary</CardTitle>
              <CardDescription>
                Repeated context clues can help identify recurring distress, without making accusations.
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-3">
              {patterns.slice(0, 2).map((pattern) => (
                <div key={pattern.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{pattern.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                        {pattern.summary}
                      </p>
                    </div>
                    <Badge tone="primary">{Math.round(pattern.confidence)}%</Badge>
                  </div>
                  <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
                    Recommended next step: {pattern.recommendedAction}
                  </p>
                </div>
              ))}
              {!patterns.length ? (
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  No repeated patterns yet. Keep logging structured observations.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Recent alerts</CardTitle>
                <CardDescription>Dismiss, escalate, or convert to an incident with audit logging.</CardDescription>
              </div>
              <Badge tone={alerts.length ? "warning" : "success"}>{alerts.length} open</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {alerts.slice(0, 3).map((alert) => (
              <form key={alert.id} action={alertAction}>
                <input type="hidden" name="alertId" value={alert.id} />
                <AlertCard
                  alert={alert}
                  actionSlot={
                    <>
                      <Button type="submit" size="sm" variant="secondary" name="action" value="dismiss">
                        Dismiss
                      </Button>
                      <button
                        type="submit"
                        name="action"
                        value="escalate"
                        className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-secondary)]/35"
                      >
                        Escalate
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="incident"
                        className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary)]/10"
                      >
                        Create incident
                      </button>
                    </>
                  }
                />
              </form>
            ))}
            {!alerts.length ? (
              <EmptyState
                title="No open alerts"
                description="When a signal crosses a threshold, it will appear here with clear reasons and next steps."
              />
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent timeline</CardTitle>
            <CardDescription>
              Date, time, signal type, severity, source, and whether the item has been reviewed.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            {timeline.slice(0, 4).map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
