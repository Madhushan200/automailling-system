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

// ============================================================================
// 2. CUSTOMER-FACING QUOTATION & PROPOSAL PDF (Clean selling rates, no margins)
// ============================================================================
export function buildQuotationCustomerPDFDoc(quote: any, customSettings?: Partial<CompanySettings>): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const company = {
    ...initialCompanySettings,
    ...(customSettings || {}),
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const primaryColor: [number, number, number] = [15, 23, 42]; // #0F172A
  const secondaryColor: [number, number, number] = [1, 112, 199]; // #0170C7
  const slateDark: [number, number, number] = [51, 65, 85];
  const slateLight: [number, number, number] = [148, 163, 184];
  const bgLight: [number, number, number] = [248, 250, 252];
  const borderLight: [number, number, number] = [226, 232, 240];

  let currentY = margin;

  // 1. BRAND HEADER
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(company.company_name.toUpperCase(), margin + 8, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text("DESTINATION MANAGEMENT & LUXURY HOLIDAY PROPOSALS", margin + 8, currentY + 18);

  doc.setFontSize(8);
  doc.setTextColor(241, 245, 249);
  doc.text(`Hotline: ${company.phone}`, pageWidth - margin - 8, currentY + 9, { align: "right" });
  doc.text(`Email: ${company.email}`, pageWidth - margin - 8, currentY + 14, { align: "right" });
  doc.text(`Web: ${company.website}`, pageWidth - margin - 8, currentY + 19, { align: "right" });

  currentY += 29;

  // 2. PROPOSAL TITLE BAR
  doc.setDrawColor(...borderLight);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.text("OFFICIAL TOUR PROPOSAL & QUOTATION", margin + 6, currentY + 9.5);

  const revBadge = quote.revision_number > 0 ? ` (${quote.revision_label || `Rev ${quote.revision_number}`})` : "";
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text(`QUOTE NO: ${quote.quote_number || "DL-2026-0001"}${revBadge}`, pageWidth - margin - 6, currentY + 9.5, { align: "right" });

  currentY += 18;

  // 3. CLIENT & TRIP OVERVIEW
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Guest Details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, colWidth, 38, 2, 2, "FD");

  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, currentY, colWidth, 6.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CLIENT & PASSENGER INFORMATION", margin + 4, currentY + 4.5);

  let leftY = currentY + 11.5;
  const drawRow = (lbl: string, val: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...slateLight);
    doc.text(lbl.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text(val || "—", x + 30, y);
  };

  drawRow("Client Name:", quote.client_name || "Valued Traveler", margin + 4, leftY);
  drawRow("Contact:", quote.client_phone || quote.client_email || "Direct", margin + 4, leftY + 6);
  drawRow("Nationality:", quote.client_nationality || quote.client_country || "International", margin + 4, leftY + 12);
  drawRow("Passengers:", `${quote.total_pax || 2} Pax (${quote.adults_count || 2} Adults, ${quote.children_count || 0} Children)`, margin + 4, leftY + 18);

  // Right Box: Tour & Travel Details
  const rightX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(rightX, currentY, colWidth, 38, 2, 2, "FD");

  doc.setFillColor(...secondaryColor);
  doc.roundedRect(rightX, currentY, colWidth, 6.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("TRAVEL DATES & PROGRAM SUMMARY", rightX + 4, currentY + 4.5);

  let rightY = currentY + 11.5;
  drawRow("Tour Name:", quote.tour_name || "Sri Lanka Highlights", rightX + 4, rightY);
  drawRow("Duration:", `${quote.days_count || 1} Days / ${quote.nights_count || 1} Nights`, rightX + 4, rightY + 6);
  drawRow("Travel Dates:", `${quote.arrival_date || quote.travel_start_date || "TBD"} → ${quote.departure_date || quote.travel_end_date || "TBD"}`, rightX + 4, rightY + 12);
  drawRow("Vehicle:", quote.vehicle_name || "Private Air-Conditioned Tourist Vehicle", rightX + 4, rightY + 18);

  currentY += 43;

  // 4. ACCOMMODATION TABLE
  if (quote.accommodation_items && quote.accommodation_items.length > 0) {
    const accomHeaders = [["NIGHT", "DATE", "HOTEL / RESORT", "LOCATION", "MEAL PLAN", "ROOMS"]];
    const accomRows = quote.accommodation_items.map((acc: any, i: number) => {
      let roomStr = "";
      if (acc.sgl_rooms) roomStr += `${acc.sgl_rooms} SGL `;
      if (acc.dbl_rooms) roomStr += `${acc.dbl_rooms} DBL `;
      if (acc.tpl_rooms) roomStr += `${acc.tpl_rooms} TPL `;
      if (!roomStr) roomStr = acc.room_type || "Standard Room";

      return [
        `Night ${i + 1}`,
        acc.date || `Day ${i + 1}`,
        acc.hotel_name || "Hotel",
        acc.city || "Sri Lanka",
        acc.meal_plan || "Half Board (HB)",
        roomStr.trim(),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: accomHeaders,
      body: accomRows,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.8, font: "helvetica", textColor: [15, 23, 42] },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { halign: "center", cellWidth: 16 },
        1: { halign: "center", cellWidth: 22 },
        2: { fontStyle: "bold" },
        3: { cellWidth: 26 },
        4: { halign: "center", cellWidth: 28, textColor: [1, 112, 199], fontStyle: "bold" },
        5: { halign: "center", cellWidth: 32 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 5. PACKAGE PRICING BOX
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("OFFICIAL PACKAGE INVESTMENT & PRICING OPTIONS:", margin + 4, currentY + 5.5);

  const cur = quote.currency || "USD";
  const costSum = quote.costing_summary || {};
  const totalAmt = quote.total_amount || costSum.finalSellingPrice || 0;
  const ppRate = quote.selling_pp_rate || costSum.finalPPRate || (quote.total_pax ? totalAmt / quote.total_pax : 0);

  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.text(`TOTAL PACKAGE: $${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`, margin + 4, currentY + 14);

  doc.setFontSize(9.5);
  doc.setTextColor(...slateDark);
  if (costSum.dblSellingPP > 0) {
    doc.text(`DBL Sharing: $${costSum.dblSellingPP.toFixed(2)} / Pax  •  TPL Sharing: $${costSum.tplSellingPP.toFixed(2)} / Pax`, pageWidth - margin - 4, currentY + 14, { align: "right" });
  } else if (ppRate > 0) {
    doc.text(`Per Person Rate: $${ppRate.toFixed(2)} / Pax (${quote.total_pax || 2} Guests)`, pageWidth - margin - 4, currentY + 14, { align: "right" });
  }

  currentY += 26;

  // 6. INCLUSIONS & EXCLUSIONS
  const halfW = (contentWidth - 6) / 2;

  // Inclusions Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, halfW, 36, 2, 2, "FD");

  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(margin, currentY, halfW, 5.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("✓ WHAT IS INCLUDED", margin + 4, currentY + 4);

  const incList = quote.inclusions && quote.inclusions.length > 0 ? quote.inclusions : [
    "Accommodation on requested meal plan",
    "Private air-conditioned tourist vehicle & chauffeur",
    "All entrance tickets as per itinerary",
    "Fuel, highway tolls, driver night allowances & parking",
    "Government taxes and service charges",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateDark);
  let incY = currentY + 9;
  incList.slice(0, 5).forEach((inc: string) => {
    doc.text(`• ${inc}`, margin + 3, incY, { maxWidth: halfW - 6 });
    incY += 5;
  });

  // Exclusions Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(rightX, currentY, halfW, 36, 2, 2, "FD");

  doc.setFillColor(239, 68, 68); // Red
  doc.roundedRect(rightX, currentY, halfW, 5.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("✕ WHAT IS EXCLUDED", rightX + 4, currentY + 4);

  const excList = quote.exclusions && quote.exclusions.length > 0 ? quote.exclusions : [
    "International flight tickets & Sri Lanka tourist visa",
    "Lunch meals and alcoholic beverages",
    "Camera & video permit fees",
    "Personal expenses, laundry, and gratuities",
  ];

  let excY = currentY + 9;
  excList.slice(0, 5).forEach((exc: string) => {
    doc.text(`• ${exc}`, rightX + 3, excY, { maxWidth: halfW - 6 });
    excY += 5;
  });

  currentY += 40;

  // 7. FOOTER & VALIDITY
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateLight);
  doc.text(
    `Valid Until: ${quote.valid_until || "14 Days from issue"} • Prepared by Dodoz Leisure Reservations • ${company.website}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  return doc;
}

// ============================================================================
// 3. INTERNAL COSTING SHEET PDF (Full Excel Reproduction with Margins)
// ============================================================================
export function buildInternalCostingPDFDoc(quote: any, customSettings?: Partial<CompanySettings>): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const primaryColor: [number, number, number] = [15, 23, 42];
  const secondaryColor: [number, number, number] = [1, 112, 199];
  const borderLight: [number, number, number] = [226, 232, 240];

  let currentY = margin;

  // 1. TOP CONFIDENTIAL HEADER
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("DODOZ LEISURE — INTERNAL COSTING & MARGIN MATRIX", margin + 6, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68); // Red text
  doc.text("STRICTLY CONFIDENTIAL • INTERNAL AGENCY USE ONLY", margin + 6, currentY + 14);

  const costSum = quote.costing_summary || {};
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`QUOTE REF: ${quote.quote_number || "DL-2026-0001"}`, pageWidth - margin - 6, currentY + 8, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`PAX: ${quote.total_pax || 5} | DAYS: ${quote.days_count || 7}`, pageWidth - margin - 6, currentY + 14, { align: "right" });

  currentY += 22;

  // 2. SECTION 1: ACCOMMODATION BREAKDOWN (Excel replica)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("1. HOTEL ACCOMMODATION BREAKDOWN (USD)", margin, currentY);
  currentY += 3;

  const accomHeaders = [["DATE / NIGHT", "HOTEL NAME", "SGL RMS", "SGL RATE", "DBL RMS", "DBL RATE", "TPL RMS", "TPL RATE", "ROW TOTAL"]];
  const accomRows = (quote.accommodation_items || []).map((acc: any, i: number) => {
    const sglTot = (acc.sgl_rooms || 0) * (acc.sgl_rate || 0);
    const dblTot = (acc.dbl_rooms || 0) * (acc.dbl_rate || 0);
    const tplTot = (acc.tpl_rooms || 0) * (acc.tpl_rate || 0);
    const rowTot = sglTot + dblTot + tplTot;

    return [
      acc.date || `Night ${i + 1}`,
      acc.hotel_name || "Hotel",
      acc.sgl_rooms || "-",
      acc.sgl_rate ? `$${acc.sgl_rate}` : "-",
      acc.dbl_rooms || "-",
      acc.dbl_rate ? `$${acc.dbl_rate}` : "-",
      acc.tpl_rooms || "-",
      acc.tpl_rate ? `$${acc.tpl_rate}` : "-",
      `$${rowTot.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: accomHeaders,
    body: accomRows,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2, font: "helvetica" },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { fontStyle: "bold" },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "right", cellWidth: 16 },
      4: { halign: "center", cellWidth: 14 },
      5: { halign: "right", cellWidth: 16 },
      6: { halign: "center", cellWidth: 14 },
      7: { halign: "right", cellWidth: 16 },
      8: { halign: "right", cellWidth: 20, fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Accommodation Subtotals line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    `Total Accom Cost: $${(costSum.accommodationTotal || 0).toFixed(2)}  |  DBL PP: $${(costSum.dblCostPP || 0).toFixed(2)}  |  TPL PP: $${(costSum.tplCostPP || 0).toFixed(2)}`,
    margin,
    currentY
  );
  currentY += 7;

  // 3. SECTION 2: TRANSPORTATION BREAKDOWN (Excel replica)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("2. TRANSPORTATION & VEHICLE COSTING (LKR & USD)", margin, currentY);
  currentY += 3;

  const transportHeaders = [["DAY", "ROUTE DESCRIPTION", "KM"]];
  const transportRows = (quote.transport_days || []).map((tr: any) => [
    tr.day_label || `DAY ${tr.day_number || 1}`,
    tr.route || "Tour Route",
    `${tr.km || 0} KM`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: transportHeaders,
    body: transportRows,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 1.8, font: "helvetica" },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { fontStyle: "normal" },
      2: { halign: "right", cellWidth: 24, fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Transport details summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Route Distance: ${costSum.totalKM || 1240} KM  •  Rate: LKR ${quote.vehicle_rate_per_km || 140}/KM  •  Vehicle: ${quote.vehicle_name || "Mini Coach"}`, margin + 4, currentY + 5);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Transport LKR: LKR ${(costSum.transportTotalLKR || 196100).toLocaleString()}  (Converted @ ${quote.exchange_rate_lkr_usd || 325} LKR/USD = $${(costSum.transportTotalUSD || 603.38).toFixed(2)})  •  Transport PP: $${(costSum.transportCostPP || 120.68).toFixed(2)}`, margin + 4, currentY + 10);

  currentY += 18;

  // 4. SECTION 3: MISCELLANEOUS & ENTRANCE FEES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("3. MISCELLANEOUS & ENTRANCE TICKETS (USD)", margin, currentY);
  currentY += 3;

  const miscHeaders = [["ITEM", "CATEGORY", "UNIT", "QTY", "RATE", "TOTAL COST"]];
  const miscRows = (quote.misc_items || []).map((m: any) => {
    const isPP = m.is_per_person !== false;
    const qty = Number(m.qty) || 1;
    const rate = Number(m.rate) || 0;
    const rowCost = isPP ? rate * qty * (quote.total_pax || 1) : rate * qty;

    return [
      m.item,
      m.category || "General",
      m.unit || (isPP ? "Per Person" : "Per Group"),
      qty,
      `$${rate.toFixed(2)}`,
      `$${rowCost.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: miscHeaders,
    body: miscRows,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5, font: "helvetica" },
    headStyles: { fillColor: [100, 116, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
    columnStyles: {
      0: { fontStyle: "bold" },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 20, fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 5. SECTION 4: CONSOLIDATED FINANCIAL MATRIX & MARGINS
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("4. FINANCIAL MATRIX & PROFIT MARGIN RECONCILIATION", margin + 4, currentY + 5.5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Net Cost of Sales: $${(costSum.netCostSubtotal || 0).toFixed(2)}  (Accom: $${(costSum.accommodationTotal || 0).toFixed(2)} + Trans: $${(costSum.transportTotalUSD || 0).toFixed(2)} + Misc: $${(costSum.miscTotal || 0).toFixed(2)})`, margin + 4, currentY + 11);

  const markupLbl = costSum.markupType === "percentage" ? `${costSum.markupValue}%` : `$${costSum.markupValue} / Pax`;
  doc.setFont("helvetica", "bold");
  doc.text(`Markup Applied: ${markupLbl} (+$${(costSum.totalMarkupAmount || 0).toFixed(2)})  •  Gross Profit: $${(costSum.grossProfit || 0).toFixed(2)} (${(costSum.grossMarginPercent || 0).toFixed(1)}% Margin)`, margin + 4, currentY + 16.5);

  doc.setTextColor(56, 189, 248); // Cyan
  doc.setFontSize(9.5);
  doc.text(`FINAL SELLING PRICE: $${(costSum.finalSellingPrice || quote.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}  |  SELLING PP: $${(costSum.finalPPRate || 0).toFixed(2)}`, margin + 4, currentY + 21.5);

  return doc;
}

// Helpers for Data URLs
export function getQuotationCustomerPDFDataUrl(quote: any): string {
  const doc = buildQuotationCustomerPDFDoc(quote);
  return doc.output("dataurlstring");
}

export function getInternalCostingPDFDataUrl(quote: any): string {
  const doc = buildInternalCostingPDFDoc(quote);
  return doc.output("dataurlstring");
}

