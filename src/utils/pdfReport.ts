import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Violation, Worker, InsightBucket } from "../types";

interface PdfFilters {
  status?: string;
  department?: string;
  from?: string;
  to?: string;
}

interface PdfSummary {
  statusBuckets: InsightBucket[];
  severityBuckets: InsightBucket[];
}

type RGB = [number, number, number];

const STATUS_COLORS: Record<string, RGB> = {
  open: [242, 169, 0],
  acknowledged: [31, 157, 85],
  escalated: [215, 38, 61],
};

const SEVERITY_COLORS: Record<string, RGB> = {
  low: [148, 163, 184],
  medium: [234, 137, 20],
  high: [215, 38, 61],
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Draws a simple horizontal bar chart directly with jsPDF vector primitives
 * (rectangles + text) — no DOM screenshot involved, so it can't be broken by
 * browser color-function support (e.g. Tailwind's oklch() colors, which
 * html2canvas cannot parse).
 */
const drawBarChart = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  buckets: InsightBucket[],
  colorMap: Record<string, RGB>,
  fallback: RGB
): number => {
  const barHeight = 14;
  const gap = 10;
  const labelWidth = 78;
  const countWidth = 28;
  const barAreaWidth = width - labelWidth - countWidth;
  const max = Math.max(...buckets.map((b) => b.count), 1);

  buckets.forEach((b, i) => {
    const by = y + i * (barHeight + gap);
    const color = colorMap[b.label] || fallback;
    const barW = Math.max((b.count / max) * barAreaWidth, 3);

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text(capitalize(b.label), x, by + barHeight / 2 + 3);

    doc.setFillColor(...color);
    doc.roundedRect(x + labelWidth, by, barW, barHeight, 2.5, 2.5, "F");

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(String(b.count), x + labelWidth + barW + 6, by + barHeight / 2 + 3);
  });

  return y + buckets.length * (barHeight + gap);
};

/**
 * Builds and downloads a PDF violations report: branded header, applied
 * filters, native vector bar charts summarizing status/severity, and a full
 * data table of every matching violation.
 */
export const generateViolationsPdf = (violations: Violation[], filters: PdfFilters, summary: PdfSummary) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SiteGuard", margin, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("PPE Compliance — Violations Report", margin, 44);

  // Meta section
  doc.setTextColor(30, 30, 30);
  let y = 84;
  doc.setFontSize(9.5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 14;

  const filterParts: string[] = [];
  if (filters.status) filterParts.push(`Status: ${filters.status}`);
  if (filters.department) filterParts.push(`Department: ${filters.department}`);
  if (filters.from) filterParts.push(`From: ${filters.from}`);
  if (filters.to) filterParts.push(`To: ${filters.to}`);
  doc.text(`Filters: ${filterParts.length ? filterParts.join("   ·   ") : "None (all violations)"}`, margin, y);
  y += 14;
  doc.text(`Total records: ${violations.length}`, margin, y);
  y += 24;

  // Native vector charts (two columns): status breakdown + severity breakdown
  if (summary.statusBuckets.length > 0 || summary.severityBuckets.length > 0) {
    const colWidth = (pageWidth - margin * 2 - 24) / 2;
    const chartTop = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("Status Breakdown", margin, chartTop);
    doc.text("Severity Breakdown", margin + colWidth + 24, chartTop);
    doc.setFont("helvetica", "normal");

    const afterStatus =
      summary.statusBuckets.length > 0
        ? drawBarChart(doc, margin, chartTop + 16, colWidth, summary.statusBuckets, STATUS_COLORS, [100, 116, 139])
        : chartTop + 16;
    const afterSeverity =
      summary.severityBuckets.length > 0
        ? drawBarChart(
            doc,
            margin + colWidth + 24,
            chartTop + 16,
            colWidth,
            summary.severityBuckets,
            SEVERITY_COLORS,
            [100, 116, 139]
          )
        : chartTop + 16;

    y = Math.max(afterStatus, afterSeverity) + 16;
  }

  // Data table
  const rows = violations.map((v) => {
    const worker = v.worker as Worker;
    return [
      worker?.name || "Unknown",
      worker?.workerId || "-",
      v.department,
      v.ppeType,
      v.severity,
      v.status,
      new Date(v.detectedAt).toLocaleString(),
      v.acknowledgedAt ? new Date(v.acknowledgedAt).toLocaleString() : "-",
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Worker", "Worker ID", "Department", "PPE Type", "Severity", "Status", "Detected At", "Acknowledged At"]],
    body: rows,
    styles: { fontSize: 7.5, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [11, 18, 32], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 246, 248] },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `SiteGuard PPE Compliance Monitoring — Page ${pageCount}`,
        margin,
        doc.internal.pageSize.getHeight() - 16
      );
    },
  });

  doc.save(`violations-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};