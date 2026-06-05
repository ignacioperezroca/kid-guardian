import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import { deleteWorkspaceAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
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
  SectionTitle,
} from "@/components/ui";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_settings",
    targetType: "settings",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { exportRequests: workspace.exportRequests.length },
    ipAddress: null,
    userAgent: null,
  });

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Settings"
        title="Access, audit, consent, and data controls"
        description="Every sensitive action stays visible. Exports are logged, and deletion is a real workflow."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Access matrix</CardTitle>
            <CardDescription>
              Roles are read-only for viewers and more permissive for guardians.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((role) => (
              <div key={role} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                    <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                  <Badge tone="neutral">{role.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data controls</CardTitle>
            <CardDescription>
              Request exports or delete workspace data with an explicit confirmation step.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
              <p className="text-sm font-medium">Export requests</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {workspace.exportRequests.length
                  ? `${workspace.exportRequests.length} request${workspace.exportRequests.length === 1 ? "" : "s"} logged in the audit trail.`
                  : "No exports have been requested yet."}
              </p>
            </div>

            <div className="rounded-3xl border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/6 p-4">
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                Delete workspace data
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                This removes the active child profile and related workspace data. A deletion audit log is retained.
              </p>
              <form action={deleteWorkspaceAction} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="confirmDelete">Type DELETE to confirm</Label>
                  <Input id="confirmDelete" name="confirmDelete" placeholder="DELETE" required />
                </div>
                <Button type="submit" variant="danger" className="w-full">
                  Delete workspace data
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Consent records</CardTitle>
            <CardDescription>
              Consent acknowledgements and legal responsibility confirmations.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-3">
            {workspace.consentRecords.length ? (
              workspace.consentRecords.map((consent) => (
                <div key={consent.id} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">{consent.consentType.replace(/_/g, " ").toLowerCase()}</p>
                    <Badge tone={consent.accepted ? "success" : "warning"}>{consent.accepted ? "Accepted" : "Pending"}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                    Granted {formatDateTime(consent.grantedAt)} · version {consent.version}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No consent records yet"
                description="Consent acknowledgements will appear here after sign-up and when monitoring or sharing settings change."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Every sensitive read, write, and export is recorded.</CardDescription>
          </CardHeader>
          <CardBody className="space-y-3">
            {workspace.auditLogs.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--color-background)]/75 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
                  <Badge tone={entry.severity === "critical" ? "danger" : entry.severity === "warning" ? "warning" : "neutral"}>
                    {entry.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                  {formatDateTime(entry.createdAt)} · {entry.targetType}
                  {entry.targetId ? ` · ${entry.targetId}` : ""}
                </p>
              </div>
            ))}
            {!workspace.auditLogs.length ? (
              <EmptyState
                title="No audit entries yet"
                description="Access and export actions will appear here automatically."
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
