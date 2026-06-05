import { signOutAction } from "@/app/actions";
import { APP_NAME, APP_TAGLINE, NAV_ITEMS } from "@/lib/constants";
import type { WorkspaceData } from "@/lib/types";
import { Badge, Button, Card, CardBody, CardDescription, CardHeader, CardTitle, PageShell } from "./ui";
import { NavLink } from "./nav-link";
import { formatRiskBand, formatShortDate } from "@/lib/format";

export function AppShell({
  workspace,
  children,
}: {
  workspace: WorkspaceData;
  children: React.ReactNode;
}) {
  const { user, child, permissions, safeMode, stats } = workspace;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,122,117,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(164,144,90,0.12),_transparent_22%),linear-gradient(180deg,_var(--color-background),_#eef3ef_120%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[color:var(--border)] bg-[color:var(--color-background)]/85 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[320px] lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-5">
            <div>
              <p className="text-lg font-semibold tracking-[-0.04em] text-[color:var(--color-foreground)]">
                {APP_NAME}
              </p>
              <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                {APP_TAGLINE}
              </p>
            </div>
            <Badge tone={stats.riskBand}>{formatRiskBand(stats.riskBand)}</Badge>
          </div>

          <div className="space-y-4 px-5 py-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{child ? child.name : "Create your first child profile"}</CardTitle>
                <CardDescription>
                  {child
                    ? `${child.developmentStage} • ${child.ageMonths} months old`
                    : "Set up the child profile to begin transparent monitoring."}
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={safeMode.monitorModeEnabled ? "success" : "neutral"}>
                    Monitor {safeMode.monitorModeEnabled ? "active" : "off"}
                  </Badge>
                  <Badge tone={safeMode.audioModeEnabled ? "primary" : "neutral"}>
                    Audio {safeMode.audioModeEnabled ? "enabled" : "disabled"}
                  </Badge>
                </div>
                <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                  {safeMode.monitoringIndicator}
                </p>
                <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                  Privacy rule reminder: no covert recording, no raw audio storage by default.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="neutral">Role access</Badge>
                  <Badge tone="neutral">
                    {permissions.canManageAccess ? "Primary guardian" : "Limited viewer"}
                  </Badge>
                </div>
              </CardBody>
            </Card>

            <nav className="grid gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-[color:var(--border)] px-5 py-5">
            <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
                Signed in as
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--color-foreground)]">
                {user.name}
              </p>
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                {user.email}
              </p>
              <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
                  Last status update:{" "}
                  {formatShortDate(child?.updatedAt ?? workspace.user.updatedAt)}
              </p>
            </div>
            <form action={signOutAction} className="mt-4">
              <Button type="submit" variant="secondary" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex-1">
          <PageShell className="py-6 sm:py-8">{children}</PageShell>
        </main>
      </div>
    </div>
  );
}
