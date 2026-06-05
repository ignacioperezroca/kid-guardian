import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import { formatRiskBand } from "@/lib/format";
import { saveChildProfileAction } from "@/app/actions";
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
  SectionTitle,
  Textarea,
  LinkButton,
} from "@/components/ui";

function joinList(values: string[]) {
  return values.join(", ");
}

export default async function ChildProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "view_child_profile",
    targetType: "child_profile",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { hasChild: Boolean(workspace.child) },
    ipAddress: null,
    userAgent: null,
  });

  const child = workspace.child;

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Child profile"
        title="Structured context for safety monitoring"
        description="Keep the profile factual and updated. It informs the wellbeing dashboard, patterns, reports, and access roles."
        action={
          child ? (
            <Badge tone={child.riskBand}>{formatRiskBand(child.riskBand)}</Badge>
          ) : (
            <LinkButton href="/dashboard" variant="secondary">
              Return to dashboard
            </LinkButton>
          )}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>{child ? "Edit child profile" : "Create child profile"}</CardTitle>
            <CardDescription>
              Add only the information needed for transparent monitoring and professional sharing.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <form action={saveChildProfileAction} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Child name</Label>
                  <Input id="name" name="name" defaultValue={child?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageMonths">Age in months</Label>
                  <Input
                    id="ageMonths"
                    name="ageMonths"
                    type="number"
                    min="0"
                    max="240"
                    defaultValue={child?.ageMonths ?? 0}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="developmentStage">Development stage</Label>
                  <Input
                    id="developmentStage"
                    name="developmentStage"
                    defaultValue={child?.developmentStage ?? "Toddler"}
                    placeholder="Infant, toddler, school-age, teen"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pediatricianContact">Pediatrician / therapist contact</Label>
                  <Input
                    id="pediatricianContact"
                    name="pediatricianContact"
                    defaultValue={child?.pediatricianContact ?? ""}
                    placeholder="Dr. Smith, licensed therapist"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="knownConditions">Known conditions</Label>
                <Textarea
                  id="knownConditions"
                  name="knownConditions"
                  defaultValue={joinList(child?.knownConditions ?? [])}
                  placeholder="Comma or line separated"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wellbeingNotes">Current wellbeing notes</Label>
                <Textarea
                  id="wellbeingNotes"
                  name="wellbeingNotes"
                  defaultValue={child?.wellbeingNotes ?? ""}
                  placeholder="Sleep changes, appetite changes, mood, fear, regression, or other neutral observations"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trustedCaregivers">Trusted caregivers</Label>
                  <Textarea
                    id="trustedCaregivers"
                    name="trustedCaregivers"
                    defaultValue={joinList(
                      child?.trustedContacts.map((contact) => contact.name) ?? []
                    )}
                    placeholder="Comma or line separated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularLocations">Regular locations</Label>
                  <Textarea
                    id="regularLocations"
                    name="regularLocations"
                    defaultValue={joinList(child?.locations.map((location) => location.label) ?? [])}
                    placeholder="Comma or line separated"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContacts">Emergency contacts</Label>
                <Textarea
                  id="emergencyContacts"
                  name="emergencyContacts"
                  defaultValue={joinList(child?.emergencyContacts ?? [])}
                  placeholder="Comma or line separated"
                />
              </div>

              <Button type="submit" className="w-full">
                Save child profile
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile summary</CardTitle>
              <CardDescription>
                This is the fact base used by the timeline, patterns, and report exports.
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {child ? (
                <>
                  <p>
                    <strong className="text-[color:var(--color-foreground)]">Risk band:</strong>{" "}
                    {formatRiskBand(child.riskBand)}
                  </p>
                  <p>
                    <strong className="text-[color:var(--color-foreground)]">Audio mode:</strong>{" "}
                    {child.audioModeEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p>
                    <strong className="text-[color:var(--color-foreground)]">Monitoring:</strong>{" "}
                    {child.monitorModeEnabled ? "Active" : "Inactive"}
                  </p>
                  <p>
                    <strong className="text-[color:var(--color-foreground)]">Consent:</strong>{" "}
                    {child.consentConfirmed ? "Confirmed" : "Pending"}
                  </p>
                </>
              ) : (
                <p>Once you create a profile, the workspace will start surfacing trends and alerts.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role permissions</CardTitle>
              <CardDescription>
                Role-based access is explicit and different for each viewer type.
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-3">
              {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((role) => (
                <div key={role} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)]/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                    <Badge tone="neutral">{role.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
