import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { patternSummary } from "@/lib/patterns";
import { Badge, Card, CardBody, CardDescription, CardHeader, CardTitle, EmptyState, PageShell, PatternCard, SectionTitle } from "@/components/ui";

export default async function PatternsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_patterns",
    targetType: "patterns",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { patternCount: workspace.patterns.length },
    ipAddress: null,
    userAgent: null,
  });

  if (!workspace.child) {
    return (
      <PageShell>
        <SectionTitle
          eyebrow="Pattern detection"
          title="Create a child profile to surface repeated signals"
          description="Patterns are built from structured observations, not hidden surveillance."
        />
        <div className="mt-8">
          <EmptyState
            title="No pattern data yet"
            description="Once the child profile and incident log have a few entries, the workspace will start surfacing repeated contexts and timing clues."
          />
        </div>
      </PageShell>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Pattern detection"
        title="Repeated signals and context cues"
        description="The app highlights repeated associations such as distress after visits, sleep disruption after specific days, or recurring fear language."
      />

      <Card className="border-[color:var(--color-primary)]/15 bg-white/82">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Pattern summary</CardTitle>
              <CardDescription>
                The goal is to notice recurrence early and help guardians document next steps responsibly.
              </CardDescription>
            </div>
            <Badge tone="primary">{workspace.patterns.length} patterns</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            {patternSummary(workspace.patterns)}
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {workspace.patterns.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>

      {!workspace.patterns.length ? (
        <EmptyState
          title="No repeated patterns yet"
          description="Add a few more incidents or mock events and the pattern model will begin highlighting recurring distress and context links."
        />
      ) : null}
    </div>
  );
}

