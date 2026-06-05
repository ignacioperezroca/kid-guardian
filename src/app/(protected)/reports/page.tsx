import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { exportReportAction, generateReportAction } from "@/app/actions";
import { formatDateTime, formatRiskBand } from "@/lib/format";
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
  Textarea,
  TimelineCard,
} from "@/components/ui";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_reports",
    targetType: "reports",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { reports: workspace.reports.length },
    ipAddress: null,
    userAgent: null,
  });

  if (!workspace.child) {
    return (
      <PageShell>
        <SectionTitle
          eyebrow="Reports"
          title="Create a child profile and incident history first"
          description="The report export uses the timeline, patterns, and guardian notes to create a professional handoff."
        />
        <div className="mt-8">
          <EmptyState
            title="No report available yet"
            description="Once the profile and incident log exist, you can generate a shareable report for a pediatrician, therapist, or school counselor."
          />
        </div>
      </PageShell>
    );
  }

  const report = workspace.reports[0];

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Reports"
        title="Professional safety report"
        description="Summaries are designed for careful review, not automatic conclusions. The report includes the disclaimer on export."
      />

      <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <Card>
          <CardHeader>
            <CardTitle>Generate report</CardTitle>
            <CardDescription>
              Build a structured summary from the current workspace, timeline, and patterns.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <form action={generateReportAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Report title</Label>
                <Input id="title" name="title" placeholder={`${workspace.child.name} wellbeing summary`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianNotes">Guardian notes</Label>
                <Textarea
                  id="guardianNotes"
                  name="guardianNotes"
                  placeholder="What should a professional know about this timeline?"
                />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="includeIncidents" defaultChecked />
                Include incidents in the report snapshot
              </label>
              <Button type="submit" className="w-full">
                Generate report
              </Button>
            </form>

            {report ? (
              <div className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <p className="text-sm font-medium">Latest report metadata</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  Generated {formatDateTime(report.generatedAt)} · {formatRiskBand(report.riskBand)} · {Math.round(report.riskScore)}/100
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/api/reports/${report.id}/pdf`}
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-primary-foreground)]"
                  >
                    Download PDF
                  </Link>
                  <form action={exportReportAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="reason" value="Professional safety report export" />
                    <Button type="submit" variant="secondary">
                      Log export request
                    </Button>
                  </form>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card className="border-[color:var(--color-primary)]/15 bg-white/84">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Current report snapshot</CardTitle>
                <CardDescription>
                  A concise handoff for pediatricians, therapists, school counselors, or other approved viewers.
                </CardDescription>
              </div>
              {report ? <Badge tone={report.riskBand}>{formatRiskBand(report.riskBand)}</Badge> : null}
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {report ? (
              <>
                <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                    Summary
                  </p>
                  <p className="mt-3 text-sm leading-7">{report.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                      Guardian notes
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      {report.guardianNotes || "No extra guardian notes were added to this report."}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                      Recommended questions
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                      {report.recommendedQuestions.map((question) => (
                        <li key={question} className="rounded-2xl bg-white/70 px-3 py-2">
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                    Disclaimer
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    {report.disclaimer}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState
                title="No report generated yet"
                description="Generate the first report once you have enough structured observations to share with a professional."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Timeline included in the report</CardTitle>
            <CardDescription>
              The report snapshot uses the same structured timeline shown across the workspace.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            {(report?.timeline ?? workspace.timeline).slice(0, 5).map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pattern and incident overview</CardTitle>
            <CardDescription>
              Repeated signals, related incidents, and current risk level.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                Risk level
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                {formatRiskBand(workspace.stats.riskBand)} ({Math.round(workspace.stats.riskScore)}/100)
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                Patterns
              </p>
              <p className="mt-2">{workspace.patterns.length} repeated pattern{workspace.patterns.length === 1 ? "" : "s"} detected.</p>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                Incidents attached
              </p>
              <p className="mt-2">{workspace.incidents.length} structured incident{workspace.incidents.length === 1 ? "" : "s"} available.</p>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                Disclaimer in export
              </p>
              <p className="mt-2">{LEGAL_DISCLAIMER}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
