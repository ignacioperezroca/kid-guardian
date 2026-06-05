import { NextResponse } from "next/server";
import { getApiCurrentUser } from "@/lib/api";
import { buildReportPdf } from "@/lib/pdf";
import { getWorkspaceForUser, recordAudit } from "@/lib/store";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/reports/[id]/pdf">
) {
  const user = await getApiCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const workspace = await getWorkspaceForUser(user.id);
  const report = workspace.reports.find((item) => item.id === id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  await recordAudit({
    userId: user.id,
    childProfileId: report.childProfileId,
    action: "api_export_report_pdf",
    targetType: "report",
    targetId: report.id,
    severity: "notice",
    details: { source: "api" },
    ipAddress: null,
    userAgent: null,
  });

  const buffer = await buildReportPdf(report);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}
