import PDFDocumentConstructor from "pdfkit";
import type { Report } from "./types";
import { LEGAL_DISCLAIMER } from "./constants";

type PDFKitDocument = InstanceType<typeof PDFDocumentConstructor>;

function streamToBuffer(doc: PDFKitDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function section(doc: PDFKitDocument, title: string) {
  doc.moveDown(1);
  doc.fillColor("#18302d").fontSize(12).font("Helvetica-Bold").text(title);
  doc.moveDown(0.3);
}

export async function buildReportPdf(report: Report) {
  const doc = new PDFDocumentConstructor({
    size: "A4",
    margin: 48,
    bufferPages: true,
  });

  const bufferPromise = streamToBuffer(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#18302d")
    .text(report.title);

  doc
    .moveDown(0.3)
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#5a6866")
    .text(
      `Generated ${new Date(report.generatedAt).toLocaleString("en-US")} · Risk band ${report.riskBand} · Score ${Math.round(report.riskScore)}/100`
    );

  doc
    .moveDown(0.7)
    .roundedRect(doc.x, doc.y, 504, 46, 12)
    .fillAndStroke("#e8f1ef", "#cddeda");
  doc
    .fillColor("#18302d")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Summary", 60, 150);
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#304341")
    .text(report.summary, 60, 166, { width: 504 });

  section(doc, "Guardian notes");
  doc.font("Helvetica").fontSize(10.5).fillColor("#304341").text(report.guardianNotes || "No additional guardian notes were provided.");

  section(doc, "Timeline");
  report.timeline.slice(0, 10).forEach((entry) => {
    doc
      .font("Helvetica-Bold")
      .fillColor("#18302d")
      .fontSize(10)
      .text(`${new Date(entry.dateTime).toLocaleString("en-US")} · ${entry.signalType} · ${entry.severity}`);
    doc
      .font("Helvetica")
      .fillColor("#4f5f5c")
      .fontSize(9.2)
      .text(entry.notes, { indent: 12, width: 480 });
    doc.moveDown(0.3);
  });

  section(doc, "Patterns");
  if (report.patterns.length) {
    report.patterns.slice(0, 8).forEach((pattern) => {
      doc
        .font("Helvetica-Bold")
        .fillColor("#18302d")
        .fontSize(10)
        .text(`${pattern.title} · ${Math.round(pattern.confidence)}% confidence`);
      doc
        .font("Helvetica")
        .fillColor("#4f5f5c")
        .fontSize(9.2)
        .text(pattern.summary, { indent: 12, width: 480 });
      doc.moveDown(0.25);
    });
  } else {
    doc.font("Helvetica").fontSize(10).fillColor("#4f5f5c").text("No repeated patterns were identified yet.");
  }

  section(doc, "Questions for professionals");
  report.recommendedQuestions.forEach((question) => {
    doc.font("Helvetica").fontSize(9.5).fillColor("#304341").text(`• ${question}`, {
      width: 480,
    });
    doc.moveDown(0.1);
  });

  section(doc, "Disclaimer");
  doc
    .font("Helvetica")
    .fontSize(9.2)
    .fillColor("#5a6866")
    .text(report.disclaimer || LEGAL_DISCLAIMER);

  doc.end();
  return bufferPromise;
}
