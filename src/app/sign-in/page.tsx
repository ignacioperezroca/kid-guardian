import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { signInAction, signInDemoAction } from "../actions";
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
  LinkButton,
  PageShell,
} from "@/components/ui";

export default async function SignInPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      <PageShell className="py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-6">
            <Badge tone="primary">Returning guardian access</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.06em]">
                Sign in to review safety signals, notes, and reports.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[color:var(--color-muted-foreground)]">
                Use the same workspace to inspect the timeline, monitor settings, incidents,
                and exported reports. The account keeps the audit trail attached to your access.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>What you can expect</CardTitle>
                <CardDescription>
                  A calm, structured workspace with visible privacy indicators at every step.
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                <p>• Role-based access for guardians, viewers, and emergency contacts.</p>
                <p>• Alerts and timelines that can be reviewed without making accusations.</p>
                <p>• Exportable reports with the built-in legal disclaimer.</p>
              </CardBody>
            </Card>
          </section>

          <section>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                  Continue to the KidGuardian workspace or load the demo safely.
                </CardDescription>
              </CardHeader>
              <CardBody>
                <form action={signInAction} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="guardian@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </form>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <form action={signInDemoAction}>
                    <Button type="submit" variant="secondary" className="w-full">
                      Demo workspace
                    </Button>
                  </form>
                  <LinkButton href="/" variant="ghost" className="w-full justify-center">
                    Back to onboarding
                  </LinkButton>
                </div>
              </CardBody>
            </Card>
          </section>
        </div>
      </PageShell>
    </main>
  );
}

