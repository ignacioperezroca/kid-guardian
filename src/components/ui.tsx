import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./utils";
import { formatAlertSeverity, formatDateTime } from "@/lib/format";
import type { Alert, PatternMatch, RiskBand, TimelineEntry } from "@/lib/types";
import { ALERT_TONES } from "@/lib/constants";

export function buttonClassName(
  variant: "primary" | "secondary" | "ghost" | "danger" = "primary",
  size: "sm" | "md" | "lg" = "md"
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "border-transparent bg-[linear-gradient(135deg,#2f8f7a,#176b59)] px-5 py-2.5 text-white shadow-[0_14px_34px_rgba(47,143,122,0.22)] hover:brightness-[1.03] hover:shadow-[0_18px_40px_rgba(47,143,122,0.26)]",
    secondary:
      "border-[color:var(--border)] bg-white/80 px-5 py-2.5 text-[color:var(--color-foreground)] shadow-[0_10px_24px_rgba(16,35,31,0.05)] hover:bg-white",
    ghost:
      "border-transparent bg-transparent px-4 py-2 text-[color:var(--color-foreground)] hover:bg-[color:var(--color-secondary)]/40",
    danger:
      "border-transparent bg-[linear-gradient(135deg,#e35d5b,#c84e4b)] px-5 py-2.5 text-white shadow-[0_14px_34px_rgba(227,93,91,0.18)] hover:brightness-[1.02] hover:shadow-[0_18px_40px_rgba(227,93,91,0.22)]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(buttonClassName(variant, size), className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonClassName(variant, size), className)}>
      {children}
    </Link>
  );
}

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-[color:var(--border)] bg-[color:var(--card-elevated)]/92 shadow-[0_18px_60px_rgba(16,35,31,0.06)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 p-6 pb-4", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-[-0.02em] text-[color:var(--color-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm leading-6 text-[color:var(--color-muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | RiskBand | Alert["severity"];
  className?: string;
}) {
  const toneClass =
    tone === "neutral"
      ? "border-[color:var(--border)] bg-[color:var(--color-secondary)]/35 text-[color:var(--color-muted-foreground)]"
      : tone === "primary"
        ? "border-transparent bg-[color:var(--color-primary)]/12 text-[color:var(--color-primary)]"
        : tone === "success" || tone === "Low"
          ? "border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
          : tone === "warning" || tone === "Watch"
            ? "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]"
            : tone === "danger" || tone === "Concerning" || tone === "Urgent" || tone === "high" || tone === "critical"
              ? "border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]"
              : "border-[color:var(--border)] bg-[color:var(--color-secondary)]/35 text-[color:var(--color-muted-foreground)]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)] px-4 text-sm text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted-foreground)] shadow-sm outline-none transition focus:border-[color:var(--color-primary)]/35 focus:ring-2 focus:ring-[color:var(--color-primary)]/12",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted-foreground)] shadow-sm outline-none transition focus:border-[color:var(--color-primary)]/35 focus:ring-2 focus:ring-[color:var(--color-primary)]/12",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium tracking-[-0.01em] text-[color:var(--color-foreground)]",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-foreground)] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--color-muted-foreground)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          tone === "primary"
            ? "bg-[color:var(--color-primary)]"
            : tone === "success"
              ? "bg-[color:var(--color-success)]"
              : tone === "warning"
                ? "bg-[color:var(--color-warning)]"
                : tone === "danger"
                  ? "bg-[color:var(--color-danger)]"
                  : "bg-[color:var(--color-secondary)]"
        )}
      />
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-foreground)]">
          {value}
        </p>
        {detail ? (
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {detail}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-start gap-4 p-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold tracking-[-0.03em]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {description}
          </p>
        </div>
        {action}
      </CardBody>
    </Card>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = "primary",
}: {
  value: number;
  max?: number;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    tone === "success"
      ? "bg-[color:var(--color-success)]"
      : tone === "warning"
        ? "bg-[color:var(--color-warning)]"
        : tone === "danger"
          ? "bg-[color:var(--color-danger)]"
          : "bg-[color:var(--color-primary)]";
  return (
    <div className="h-2 rounded-full bg-[color:var(--color-secondary)]/50">
      <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${width}%` }} />
    </div>
  );
}

export function TimelineCard({
  entry,
}: {
  entry: TimelineEntry;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white/65 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={entry.severity}>{entry.signalType.replace(/_/g, " ")}</Badge>
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              {formatDateTime(entry.dateTime)}
            </span>
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-foreground)]">
            {entry.notes}
          </p>
          {entry.relatedLabel ? (
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              Context: {entry.relatedLabel}
            </p>
          ) : null}
        </div>
        <div className="max-w-xs text-right text-xs leading-5 text-[color:var(--color-muted-foreground)]">
          <p>Source: {entry.source}</p>
          <p>Confidence: {Math.round(entry.confidence)}%</p>
          <p>Reviewed: {entry.reviewedByGuardian ? "Yes" : "No"}</p>
        </div>
      </div>
      <p className="mt-3 rounded-2xl bg-[color:var(--color-secondary)]/30 px-3 py-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
        Next action: {entry.suggestedNextAction}
      </p>
    </div>
  );
}

export function AlertCard({
  alert,
  actionSlot,
}: {
  alert: Alert;
  actionSlot?: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", ALERT_TONES[alert.severity])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={alert.severity}>{formatAlertSeverity(alert.severity)}</Badge>
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              {formatDateTime(alert.createdAt)}
            </span>
          </div>
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">
            {alert.reason}
          </p>
          <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
            Source: {alert.sourceLabel} | Confidence: {Math.round(alert.confidence)}% | Status:{" "}
            {alert.status}
          </p>
        </div>
        {actionSlot ? <div className="flex flex-wrap gap-2">{actionSlot}</div> : null}
      </div>
      <p className="mt-3 rounded-2xl bg-white/60 px-3 py-2 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
        Suggested next action: {alert.suggestedAction}
      </p>
    </div>
  );
}

export function PatternCard({
  pattern,
}: {
  pattern: PatternMatch;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{pattern.title}</CardTitle>
            <CardDescription>{pattern.contextLabel}</CardDescription>
          </div>
          <Badge tone="primary">{Math.round(pattern.confidence)}% confidence</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-sm leading-6 text-[color:var(--color-foreground)]">{pattern.summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{pattern.evidenceCount} evidence items</Badge>
          <Badge tone="neutral">Last seen {formatDateTime(pattern.lastObservedAt)}</Badge>
        </div>
        <p className="text-xs leading-5 text-[color:var(--color-muted-foreground)]">
          Recommended next step: {pattern.recommendedAction}
        </p>
      </CardBody>
    </Card>
  );
}
