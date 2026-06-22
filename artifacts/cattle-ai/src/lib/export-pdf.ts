import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Analysis } from "@workspace/api-client-react";

// ── Brand Colors ───────────────────────────────────────────────────────────
const C = {
  bg: [11, 14, 19] as const,       // #0B0E13
  primary: [61, 237, 151] as const, // #3DED97
  accent: [61, 237, 151, 0.6] as const,
  white: [255, 255, 255] as const,
  gray: [148, 163, 184] as const,
  dark: [30, 41, 59] as const,
  lightGray: [203, 213, 225] as const,
};

const BREED_IMAGES: Record<string, string> = {
  "Angus": "angus.png",
  "Ayrshire": "ayrshire.png",
  "Brown Swiss": "brown-swiss.png",
  "Hereford": "hereford.png",
  "Holstein-Friesian": "holstein-friesian.png",
  "Jaffarabadi": "jaffarabadi.png",
  "Jersey": "jersey.png",
  "Red Dane": "red-dane.png",
  "Simmental": "simmental.png",
};

async function loadImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportAnalysisToPDF(
  analysis: Analysis,
  t: (key: string) => string
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;

  // ── Background ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── Header ───────────────────────────────────────────────────────────────
  // Top green bar
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 3, "F");

  // Logo / title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.white);
  doc.text("DOMESTIC CATTLE AI", margin, 14);

  // Arabic subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  doc.text(t("Welcome Message"), margin, 19);

  // Right: date
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  const dateStr = new Date(analysis.createdAt).toLocaleString();
  doc.text(dateStr, pageW - margin, 14, { align: "right" });

  // Separator line
  doc.setDrawColor(...C.dark);
  doc.setLineWidth(0.3);
  doc.line(margin, 24, pageW - margin, 24);

  // ── Section: Uploaded Image ────────────────────────────────────────────────
  let y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(t("Analyzed Image").toUpperCase(), margin, y);
  y += 4;

  // Try to add user's uploaded image
  if (analysis.imageData) {
    let userImg: string | null = null;
    try {
      const imgUrl = analysis.imageData.startsWith("data:")
        ? analysis.imageData
        : `${import.meta.env.BASE_URL}api/analyses/${analysis.id}/image`;
      userImg = analysis.imageData.startsWith("data:")
        ? analysis.imageData
        : await loadImage(imgUrl);
    } catch {
      // fallback: skip
    }
    if (userImg) {
      try {
        const imgWidth = 60;
        const imgHeight = 45;
        doc.addImage(userImg, "JPEG", margin, y, imgWidth, imgHeight);
        // Info box beside the image
        const infoX = margin + imgWidth + 8;
        const infoY = y;
        // Info background
        doc.setFillColor(20, 28, 40);
        doc.rect(infoX, infoY, 90, 45, "F");
        // Border
        doc.setDrawColor(...C.primary);
        doc.setLineWidth(0.5);
        doc.rect(infoX, infoY, 90, 45, "S");
        // Info text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...C.white);
        doc.text(t(analysis.topBreed), infoX + 4, infoY + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.gray);
        doc.text(`${t("Confidence")}: ${(analysis.topConfidence * 100).toFixed(1)}%`, infoX + 4, infoY + 18);
        if (analysis.imageName) {
          doc.text(`${analysis.imageName}`, infoX + 4, infoY + 26);
        }
        if (analysis.notes) {
          doc.text(`Notes: ${analysis.notes}`, infoX + 4, infoY + 34);
        }
        y += 50;
      } catch {
        y += 5;
      }
    } else {
      y += 5;
    }
  }

  // ── Section: Breed Image ─────────────────────────────────────────────────
  const breedFile = BREED_IMAGES[analysis.topBreed];
  if (breedFile) {
    const breedUrl = `${import.meta.env.BASE_URL}breeds/${breedFile}`;
    const breedImg = await loadImage(breedUrl);
    if (breedImg) {
      try {
        const bw = 35;
        const bh = 26;
        const bx = pageW - margin - bw;
        const by = 32;
        // Glow border
        doc.setFillColor(...C.dark);
        doc.rect(bx - 2, by - 2, bw + 4, bh + 4, "F");
        doc.setDrawColor(...C.primary);
        doc.setLineWidth(0.8);
        doc.rect(bx - 2, by - 2, bw + 4, bh + 4, "S");
        doc.addImage(breedImg, "PNG", bx, by, bw, bh);
      } catch {
        // skip
      }
    }
  }

  // ── Section: Predictions Table ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(t("Top Predictions").toUpperCase(), margin, y);
  y += 6;

  const tableData = analysis.predictions.map((p) => [
    String(p.rank),
    t(p.breed),
    `${(p.confidence * 100).toFixed(1)}%`,
    "" // Visual column placeholder — bars drawn after table
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Breed", "Confidence", "Visual"]],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [203, 213, 225],
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [11, 14, 19],
      textColor: [61, 237, 151],
      fontStyle: "bold",
      fontSize: 9,
      lineColor: [61, 237, 151],
      lineWidth: 0.5,
    },
    bodyStyles: {
      fillColor: [15, 23, 42],
      lineColor: [30, 41, 59],
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [11, 14, 19],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 60 },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
    tableWidth: pageW - margin * 2,
    didDrawCell: (data) => {
      // Draw confidence bar in the "Visual" column (index 3)
      if (data.column.index === 3 && data.section === "body") {
        const rowIdx = data.row.index;
        const confidence = analysis.predictions[rowIdx]?.confidence ?? 0;
        const cell = data.cell;
        const barW = 40;
        const barH = 4;
        const barX = cell.x + (cell.width - barW) / 2;
        const barY = cell.y + (cell.height - barH) / 2;
        // Background track
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(barX, barY, barW, barH, 1, 1, "F");
        // Filled portion
        const fillW = barW * confidence;
        doc.setFillColor(61, 237, 151);
        if (fillW > 0) {
          doc.roundedRect(barX, barY, fillW, barH, 1, 1, "F");
        }
        // Percentage text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(`${(confidence * 100).toFixed(0)}%`, barX + barW + 2, barY + 3);
      }
    },
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Bottom green bar
    doc.setFillColor(...C.primary);
    doc.rect(0, pageH - 2, pageW, 2, "F");
    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text(
      `Generated by Domestic Cattle AI · ${dateStr}`,
      margin,
      pageH - 6
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW - margin,
      pageH - 6,
      { align: "right" }
    );
  }

  doc.save(`analysis-${analysis.id}.pdf`);
}

/**
 * Draw a simple confidence bar made of block characters.
 */
function drawBar(confidence: number): string {
  const filled = Math.round(confidence * 20);
  const empty = 20 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}
