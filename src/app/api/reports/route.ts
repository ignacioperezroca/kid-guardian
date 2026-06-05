import { NextRequest, NextResponse } from "next/server";
import { getApiCurrentUser, readJsonBody } from "@/lib/api";
import { reportSchema } from "@/lib/validators";
import { createReportForUser, getWorkspaceForUser, recordAudit } from "@/lib/store";

export async function GET() {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceForUser(user.id);
  await recordAudit({
    userId: user.id,
    childProfileId: workspace.child?.id ?? null,
    action: "api_view_reports",
    targetType: "reports",
    targetId: workspace.child?.id ?? user.id,
    severity: "info",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });
  return NextResponse.json({ reports: workspace.reports });
}

export async function POST(request: NextRequest) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  const input = reportSchema.parse(body);
  const report = await createReportForUser(user.id, {
    title: input.title,
    guardianNotes: input.guardianNotes,
    includeIncidents: input.includeIncidents,
  });

  if (!report) {
    return NextResponse.json({ error: "No child profile available." }, { status: 400 });
  }

  await recordAudit({
    userId: user.id,
    childProfileId: report.childProfileId,
    action: "api_generate_report",
    targetType: "report",
    targetId: report.id,
    severity: "notice",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  return NextResponse.json({ report }, { status: 201 });
}
