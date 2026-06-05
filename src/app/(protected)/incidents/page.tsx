import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { saveIncidentAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageShell,
  SectionTitle,
  Textarea,
  EmptyState,
} from "@/components/ui";

function joinList(values: string[]) {
  return values.join(", ");
}

function IncidentForm({
  incident,
  title,
}: {
  incident?: {
    id: string;
    status: string;
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
  };
  title: string;
}) {
  return (
    <form action={saveIncidentAction} className="space-y-4">
      {incident ? <input type="hidden" name="id" value={incident.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${title}-when`}>When did it happen?</Label>
          <Input
            id={`${title}-when`}
            name="whenDidItHappen"
            type="datetime-local"
            defaultValue={
              incident?.whenDidItHappen
                ? new Date(incident.whenDidItHappen).toISOString().slice(0, 16)
                : ""
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-where`}>Where did it happen?</Label>
          <Input
            id={`${title}-where`}
            name="whereDidItHappen"
            defaultValue={incident?.whereDidItHappen ?? ""}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-whatHappened`}>What happened?</Label>
        <Textarea
          id={`${title}-whatHappened`}
          name="whatHappened"
          defaultValue={incident?.whatHappened ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-whoWasPresent`}>Who was present?</Label>
        <Textarea
          id={`${title}-whoWasPresent`}
          name="whoWasPresent"
          defaultValue={joinList(incident?.whoWasPresent ?? [])}
          placeholder="Comma or line separated"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${title}-say`}>What did the child say or do?</Label>
          <Textarea
            id={`${title}-say`}
            name="whatDidChildSayOrDo"
            defaultValue={incident?.whatDidChildSayOrDo ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-followup`}>Follow-up needed</Label>
          <Textarea
            id={`${title}-followup`}
            name="followUpNeeded"
            defaultValue={incident?.followUpNeeded ?? ""}
            placeholder="Next action, questions for professionals, or what to document next"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${title}-physical`}>Physical signs</Label>
          <Textarea
            id={`${title}-physical`}
            name="physicalSigns"
            defaultValue={incident?.physicalSigns ?? ""}
            placeholder="Bruising, fatigue, injury, or none observed"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-emotional`}>Emotional signs</Label>
          <Textarea
            id={`${title}-emotional`}
            name="emotionalSigns"
            defaultValue={incident?.emotionalSigns ?? ""}
            placeholder="Fear, withdrawal, anxiety, regression, anger, or none observed"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-notes`}>Additional notes</Label>
        <Textarea
          id={`${title}-notes`}
          name="notes"
          defaultValue={incident?.notes ?? ""}
          placeholder="Neutral context, times, transitions, or observations"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="evidenceAttached"
            defaultChecked={incident?.evidenceAttached}
          />
          Evidence attached
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="reviewedByGuardian"
            defaultChecked={incident?.reviewedByGuardian}
          />
          Reviewed by guardian
        </label>
        <div className="space-y-2">
          <Label htmlFor={`${title}-savedClipLabel`}>Saved clip label</Label>
          <Input
            id={`${title}-savedClipLabel`}
            name="savedClipLabel"
            defaultValue={incident?.savedClipLabel ?? ""}
            placeholder="Optional short label"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-status`}>Status</Label>
        <select
          id={`${title}-status`}
          name="status"
          defaultValue={incident?.status ?? "open"}
          className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)] px-4 text-sm text-[color:var(--color-foreground)] shadow-sm outline-none transition focus:border-[color:var(--color-primary)]/35 focus:ring-2 focus:ring-[color:var(--color-primary)]/12"
        >
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        {incident ? "Update incident" : "Save incident"}
      </Button>
    </form>
  );
}

export default async function IncidentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_incidents",
    targetType: "incident_log",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { incidentsTracked: workspace.incidents.length },
    ipAddress: null,
    userAgent: null,
  });

  if (!workspace.child) {
    return (
      <PageShell>
        <SectionTitle
          eyebrow="Incident log"
          title="Create a child profile first"
          description="The incident log is available once the workspace has a child profile to attach observations to."
        />
        <div className="mt-8">
          <EmptyState
            title="No incidents yet"
            description="After you create the child profile, this screen will let you add, review, and edit structured incidents."
          />
        </div>
      </PageShell>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Incident log"
        title="Structured observation and review"
        description="Use factual, neutral language. The log supports careful review and professional sharing."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>New incident</CardTitle>
            <CardDescription>
              Record what happened, who was present, what the child said or did, and any follow-up.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <IncidentForm title="new-incident" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident overview</CardTitle>
            <CardDescription>
              Review recent entries and edit them if you gather more context later.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Total incidents
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.incidents.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  Reviewed
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.incidents.filter((incident) => incident.reviewedByGuardian).length}
                </p>
              </div>
            </div>

            {workspace.incidents.slice(0, 2).map((incident) => (
              <div key={incident.id} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{incident.whereDidItHappen}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
                      {formatDateTime(incident.whenDidItHappen)}
                    </p>
                  </div>
                  <Badge tone={incident.status === "shared" ? "primary" : incident.reviewedByGuardian ? "success" : "warning"}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {incident.whatHappened}
                </p>
                <div className="mt-4">
                  <details className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
                    <summary className="cursor-pointer text-sm font-medium">Edit incident</summary>
                    <div className="mt-4">
                      <IncidentForm incident={incident} title={incident.id} />
                    </div>
                  </details>
                </div>
              </div>
            ))}
            {!workspace.incidents.length ? (
              <EmptyState
                title="No incidents saved yet"
                description="When you capture an observation, you can keep the wording neutral and edit the record if more detail becomes available."
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
