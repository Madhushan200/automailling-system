import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AccommodationRow, CompanySettings } from "./types";
import { initialCompanySettings } from "./initial-data";

export interface VoucherPDFData {
  voucherNumber: string;
  issueDate: string;
  tourNumber?: string;
  reference?: string;
  clientName?: string;
  guestCount?: number | string;
  hotelName: string;
  hotelAddress?: string;
  hotelEmail?: string;
  hotelPhone?: string;
  rows: AccommodationRow[];
  specialRequests?: string;
  remarks?: string;
  companySettings?: Partial<CompanySettings>;
}

/**
 * Generates a branded, multi-page, graphical Hotel Accommodation Voucher PDF.
 * Works seamlessly in both server (Node.js Buffer) and client (Data URI / ArrayBuffer / Blob).
 */
export function buildVoucherPDFDoc(data: VoucherPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const company = {
    ...initialCompanySettings,
    ...(data.companySettings || {}),
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Navy & Brand Palette
  const primaryColor: [number, number, number] = [15, 23, 42]; // #0F172A
  const secondaryColor: [number, number, number] = [1, 112, 199]; // #0170C7
  const slateDark: [number, number, number] = [51, 65, 85]; // #334155
  const slateLight: [number, number, number] = [148, 163, 184]; // #94A3B8
  const bgLight: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const borderLight: [number, number, number] = [226, 232, 240]; // #E2E8F0

  let currentY = margin;

  // 1. TOP HEADER BRANDING BAR
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "F");

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(company.company_name.toUpperCase(), margin + 8, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text("DESTINATION MANAGEMENT & LUXURY TRAVEL OPERATOR", margin + 8, currentY + 18);

  // Right Side: Agency Contact Info
  doc.setFontSize(8);
  doc.setTextColor(241, 245, 249);
  doc.text(`Hotline: ${company.phone}`, pageWidth - margin - 8, currentY + 9, { align: "right" });
  doc.text(`Email: ${company.email}`, pageWidth - margin - 8, currentY + 14, { align: "right" });
  doc.text(`Web: ${company.website}`, pageWidth - margin - 8, currentY + 19, { align: "right" });

  currentY += 30;

  // 2. DOCUMENT TITLE & VOUCHER BADGE BAR
  doc.setDrawColor(...borderLight);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...secondaryColor);
  doc.text(company.voucher_title || "HOTEL ACCOMMODATION VOUCHER", margin + 6, currentY + 9.5);

  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(`VOUCHER NO: ${data.voucherNumber}`, pageWidth - margin - 6, currentY + 9.5, { align: "right" });

  currentY += 19;

  // 3. TWO-COLUMN DETAILS GRID (RESERVATION INFO & HOTEL INFO)
  const colWidth = (contentWidth - 6) / 2;

  // LEFT BOX: RESERVATION & GUEST DETAILS
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, colWidth, 42, 2, 2, "FD");

  // Header ribbon
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, currentY, colWidth, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("GUEST & TOUR RESERVATION DETAILS", margin + 4, currentY + 4.8);

  // Content
  let leftY = currentY + 12;
  const drawField = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...slateLight);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text(value || "—", x + 34, y);
  };

  drawField("Client Name:", data.clientName || "Valued Guests", margin + 4, leftY);
  drawField("Tour Number:", data.tourNumber || "DZ-CUSTOM", margin + 4, leftY + 6.5);
  drawField("Reference:", data.reference || "DIRECT", margin + 4, leftY + 13);
  drawField("Issue Date:", data.issueDate || new Date().toISOString().split("T")[0], margin + 4, leftY + 19.5);
  drawField("Agency Ref:", `DOD-${data.voucherNumber.slice(-4)}`, margin + 4, leftY + 26);

  // RIGHT BOX: HOTEL PROPERTY DETAILS
  const rightX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(rightX, currentY, colWidth, 42, 2, 2, "FD");

  // Header ribbon
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(rightX, currentY, colWidth, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("HOTEL / PROPERTY RECIPIENT", rightX + 4, currentY + 4.8);

  // Content
  let rightY = currentY + 12;
  drawField("Hotel Name:", data.hotelName, rightX + 4, rightY);
  drawField("Contact Email:", data.hotelEmail || "reservations@hotel.com", rightX + 4, rightY + 6.5);
  drawField("Phone / Hotline:", data.hotelPhone || "+94 (Local)", rightX + 4, rightY + 13);
  drawField("Location / City:", data.hotelAddress || "Sri Lanka", rightX + 4, rightY + 19.5);
  drawField("Billing Basis:", "Direct Agency Account (Dodoz Leisure)", rightX + 4, rightY + 26);

  currentY += 47;

  // 4. ACCOMMODATION SCHEDULE TABLE (AutoTable)
  const tableHeaders = [
    ["#", "DATE", "SGL", "MEAL PLAN", "DBL", "TPL", "SPECIAL PREFERENCES / NOTES"],
  ];

  const formatRoomCount = (val: any) => {
    const num = Number(val);
    if (!val || isNaN(num) || num === 0) return "—";
    return String(num);
  };

  const tableRows = data.rows.map((row, idx) => [
    idx + 1,
    row.date || row.checkIn || `Day ${idx + 1}`,
    formatRoomCount(row.sgl),
    row.mealPlan || row.meal_plan || "HB",
    formatRoomCount(row.dbl),
    formatRoomCount(row.tpl),
    row.specialRequest || row.remarks || row.roomType || "As per agency contract",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      font: "helvetica",
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 28, fontStyle: "bold" },
      2: { halign: "center", cellWidth: 18, fontStyle: "bold", textColor: [51, 65, 85] },
      3: { halign: "center", cellWidth: 26, fontStyle: "bold", textColor: [1, 112, 199] },
      4: { halign: "center", cellWidth: 18, fontStyle: "bold", textColor: [51, 65, 85] },
      5: { halign: "center", cellWidth: 18, fontStyle: "bold", textColor: [51, 65, 85] },
      6: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  currentY = finalY;

  // 5. SPECIAL REQUESTS & BILLING INSTRUCTIONS
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("IMPORTANT INSTRUCTIONS & BILLING NOTES:", margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateDark);
  const notesText =
    data.specialRequests ||
    data.remarks ||
    "Please extend all VIP courtesies to our guests. All extras, beverages, and laundry are to be settled directly by guests upon checkout unless specifically authorized by Dodoz Leisure in writing.";
  const splitNotes = doc.splitTextToSize(notesText, contentWidth - 8);
  doc.text(splitNotes, margin + 4, currentY + 12);

  currentY += 28;

  // 6. HOTEL CONFIRMATION STAMP & AUTHORIZED SIGNATURE BOXES
  const signBoxWidth = (contentWidth - 6) / 2;

  // Left Signature: Agency Authorized Signature
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, signBoxWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...slateLight);
  doc.text("ISSUED & AUTHORIZED BY:", margin + 4, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("DODOZ LEISURE RESERVATIONS", margin + 4, currentY + 11);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 4, currentY + 19, margin + signBoxWidth - 4, currentY + 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateLight);
  doc.text("Authorized Travel Officer Signature & Official Seal", margin + 4, currentY + 23);

  // Right Signature: Hotel Acknowledgement & Confirmation Stamp
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(rightX, currentY, signBoxWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...slateLight);
  doc.text("HOTEL RESERVATION CONFIRMATION:", rightX + 4, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...secondaryColor);
  doc.text("HOTEL CONFIRMATION NO: ________________", rightX + 4, currentY + 12);

  doc.line(rightX + 4, currentY + 19, rightX + signBoxWidth - 4, currentY + 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateLight);
  doc.text("Hotel Front Office / Reservations Manager Signature & Stamp", rightX + 4, currentY + 23);

  // 7. BOTTOM FOOTER LEGAL CLAUSE
  doc.setFontSize(7);
  doc.setTextColor(...slateLight);
  doc.text(
    `${company.company_name} • ${company.address} • Phone: ${company.phone} • Email: ${company.email}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  return doc;
}

/**
 * Returns a Data URL for instant in-browser modal previewing
 */
export function getVoucherPDFDataUrl(data: VoucherPDFData): string {
  const doc = buildVoucherPDFDoc(data);
  return doc.output("dataurlstring");
}

/**
 * Returns a Uint8Array buffer for server-side Nodemailer email attachment
 */
export function getVoucherPDFBuffer(data: VoucherPDFData): Buffer {
  const doc = buildVoucherPDFDoc(data);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
