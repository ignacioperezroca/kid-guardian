import { ALERT_SEVERITY_LABELS, RISK_BAND_LABELS } from "./constants";
import type { AlertSeverity, RiskBand } from "./types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatDateTime(value: string | Date) {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatShortDate(value: string | Date) {
  return shortDateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatRelativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes <= 1 ? "just now" : `${Math.abs(diffMinutes)} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return diffHours <= 1 ? "1 hour ago" : `${Math.abs(diffHours)} hours ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffDays <= 1 ? "1 day ago" : `${Math.abs(diffDays)} days ago`;
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatRiskBand(band: RiskBand) {
  return RISK_BAND_LABELS[band];
}

export function formatAlertSeverity(severity: AlertSeverity) {
  return ALERT_SEVERITY_LABELS[severity];
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  return `${(totalMinutes / 60).toFixed(1)} h`;
}

export function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

