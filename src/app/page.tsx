import { redirect } from "next/navigation";
import { signInDemoAction } from "./actions";
import { getCurrentUser } from "@/lib/current-user";
import { Button, LinkButton } from "@/components/ui";
import {
  BabyMonitorPreview,
  DemoActionLabel,
  EthicalComparison,
  FAQ,
  FinalCta,
  Footer,
  Header,
  Hero,
  HowItWorks,
  PatternDetection,
  PrivacyArchitecture,
  ReportPreview,
  RiskDashboardPreview,
  StakeholderSection,
  TrustStrip,
  ProblemSection,
} from "@/components/marketing";

function DemoWorkspaceButton({
  size = "md",
  variant = "primary",
  className,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}) {
  return (
    <form action={signInDemoAction} className={className}>
      <Button type="submit" size={size} variant={variant} className="w-full">
        <DemoActionLabel />
      </Button>
    </form>
  );
}

function SampleReportButton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <form action={signInDemoAction} className={className}>
      <Button type="submit" size={size} className="w-full justify-center">
        Generate sample report
      </Button>
    </form>
  );
}

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <main className="relative isolate overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52rem] overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,143,122,0.24),transparent_64%)] blur-3xl motion-safe:animate-gradient-drift motion-reduce:animate-none" />
        <div className="absolute left-[6%] top-[8rem] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(139,183,255,0.18),transparent_68%)] blur-3xl motion-safe:animate-float-slow motion-reduce:animate-none" />
        <div className="absolute right-[8%] top-[12rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(246,200,95,0.16),transparent_68%)] blur-3xl motion-safe:animate-gradient-drift motion-reduce:animate-none" />
      </div>

      <Header primaryAction={<DemoWorkspaceButton size="sm" />} />

      <Hero
        primaryAction={<DemoWorkspaceButton size="lg" />}
        secondaryAction={<LinkButton href="#privacy" variant="secondary" size="lg">Review privacy rules</LinkButton>}
      />

      <TrustStrip />
      <ProblemSection />
      <EthicalComparison />
      <HowItWorks />
      <BabyMonitorPreview />
      <RiskDashboardPreview />
      <PatternDetection />
      <ReportPreview cta={<SampleReportButton size="md" />} />
      <PrivacyArchitecture />
      <StakeholderSection />
      <FAQ />
      <FinalCta
        primaryAction={<DemoWorkspaceButton size="lg" />}
        secondaryAction={<LinkButton href="#privacy" variant="secondary" size="lg">Review privacy principles</LinkButton>}
      />

      <Footer />
    </main>
  );
}
