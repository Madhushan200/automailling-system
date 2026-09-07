import ExcelJS from "exceljs";
import { AccommodationRow, GroupedHotelVoucher, ExcelParseResult, Hotel } from "./types";

/**
 * Normalizes column header names for robust matching
 */
function normalizeHeader(header: string): string {
  if (!header) return "";
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Map a normalized header string to a canonical AccommodationRow field
 */
function mapHeaderToField(cleanHeader: string): keyof AccommodationRow | "skip" {
  if (["date", "checkindate", "staydate", "daydate"].includes(cleanHeader)) return "date";
  if (["hotel", "hotelname", "resort", "property", "accommodation"].includes(cleanHeader)) return "hotel";
  if (["hotelemail", "email", "hotelcontactemail", "reservationemail"].includes(cleanHeader)) return "hotelEmail";
  if (["mealplan", "meal", "board", "basis", "plan"].includes(cleanHeader)) return "mealPlan";
  if (["sgl", "single", "singleroom", "sglrooms"].includes(cleanHeader)) return "sgl";
  if (["dbl", "double", "doubleroom", "dblrooms"].includes(cleanHeader)) return "dbl";
  if (["tpl", "triple", "tripleroom", "tplrooms"].includes(cleanHeader)) return "tpl";
  if (["roomtype", "category", "roomcategory", "room"].includes(cleanHeader)) return "roomType";
  if (["client", "clientname", "guestname", "guest", "paxname"].includes(cleanHeader)) return "clientName";
  if (["tournumber", "tourcode", "tourno", "tour", "bookingref", "ref"].includes(cleanHeader)) return "tourNumber";
  if (["reference", "agentref", "file"].includes(cleanHeader)) return "reference";
  if (["specialrequest", "notes", "remarks", "preference", "requests"].includes(cleanHeader)) return "specialRequest";
  return "skip";
}

/**
 * Parses an Excel binary ArrayBuffer or Buffer into validated AccommodationRow records
 */
export async function parseAccommodationExcel(
  buffer: ArrayBuffer | Buffer,
  knownHotels: Hotel[] = []
): Promise<ExcelParseResult> {
  const workbook = new ExcelJS.Workbook();
  // @ts-ignore
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return {
      success: false,
      rows: [],
      grouped: [],
      totalRows: 0,
      errors: ["No worksheet found in uploaded Excel workbook."],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const rows: AccommodationRow[] = [];

  // Find header row (usually row 1, but check first 5 rows)
  let headerRowNumber = 1;
  let headerMap: { colIndex: number; field: keyof AccommodationRow }[] = [];

  for (let r = 1; r <= 5; r++) {
    const row = worksheet.getRow(r);
    const candidateMap: { colIndex: number; field: keyof AccommodationRow }[] = [];
    row.eachCell((cell, colNumber) => {
      const cellVal = cell.value ? cell.value.toString() : "";
      const clean = normalizeHeader(cellVal);
      const field = mapHeaderToField(clean);
      if (field !== "skip") {
        candidateMap.push({ colIndex: colNumber, field });
      }
    });

    // If we matched at least date and hotel, this is our header row
    const hasDate = candidateMap.some((m) => m.field === "date");
    const hasHotel = candidateMap.some((m) => m.field === "hotel");
    if (hasDate && hasHotel) {
      headerRowNumber = r;
      headerMap = candidateMap;
      break;
    }
  }

  if (headerMap.length === 0) {
    return {
      success: false,
      rows: [],
      grouped: [],
      totalRows: 0,
      errors: [
        "Could not detect valid accommodation headers in Excel. Ensure your file contains 'Date' and 'Hotel' columns.",
      ],
      warnings: [],
    };
  }

  // Iterate data rows
  for (let r = headerRowNumber + 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    if (!row.hasValues) continue;

    const rowData: any = {
      date: "",
      hotel: "",
      mealPlan: "HB",
      sgl: 0,
      dbl: 0,
      tpl: 0,
      roomType: "Standard / Deluxe",
      clientName: "",
      tourNumber: "",
      reference: "",
      specialRequest: "",
    };

    headerMap.forEach(({ colIndex, field }) => {
      const cell = row.getCell(colIndex);
      let val = cell.value;

      if (val instanceof Date) {
        val = val.toISOString().split("T")[0];
      } else if (typeof val === "object" && val !== null && "result" in val) {
        val = (val as any).result;
      } else if (typeof val === "object" && val !== null && "text" in val) {
        val = (val as any).text;
      }

      if (["sgl", "dbl", "tpl"].includes(field as string)) {
        const num = parseInt(String(val || 0), 10);
        rowData[field] = isNaN(num) ? 0 : num;
      } else {
        rowData[field] = val !== undefined && val !== null ? String(val).trim() : "";
      }
    });

    if (rowData.hotel && rowData.hotel.length > 1) {
      rows.push(rowData as AccommodationRow);
    }
  }

  if (rows.length === 0) {
    return {
      success: false,
      rows: [],
      grouped: [],
      totalRows: 0,
      errors: ["No valid accommodation data rows found under the headers."],
      warnings: [],
    };
  }

  // Automatically Group by Hotel Property
  const grouped = groupRowsByHotel(rows, knownHotels);

  return {
    success: true,
    rows,
    grouped,
    totalRows: rows.length,
    errors,
    warnings,
  };
}

/**
 * Group accommodation schedule rows by Hotel and match registered email
 */
export function groupRowsByHotel(rows: AccommodationRow[], knownHotels: Hotel[] = []): GroupedHotelVoucher[] {
  const groups: { [hotelName: string]: AccommodationRow[] } = {};

  rows.forEach((row) => {
    const hotel = (row.hotel || "Unassigned Hotel").trim();
    if (!groups[hotel]) {
      groups[hotel] = [];
    }
    groups[hotel].push(row);
  });

  return Object.keys(groups).map((hotelName, idx) => {
    const hotelRows = groups[hotelName];
    // Sort rows by date if possible
    hotelRows.sort((a, b) => (a.date > b.date ? 1 : -1));

    // Cross-match with Known Hotels directory
    const matched = knownHotels.find(
      (h) =>
        h.hotel_name.toLowerCase().includes(hotelName.toLowerCase()) ||
        hotelName.toLowerCase().includes(h.hotel_name.toLowerCase())
    );

    let hotelEmail = "";
    let emailStatus: "matched" | "missing" | "custom" = "missing";

    if (matched && matched.reservation_email) {
      hotelEmail = matched.reservation_email;
      emailStatus = "matched";
    } else if (hotelRows[0]?.hotelEmail) {
      hotelEmail = hotelRows[0].hotelEmail;
      emailStatus = "custom";
    }

    const totalRooms = hotelRows.reduce((sum, r) => sum + (r.sgl || 0) + (r.dbl || 0) + (r.tpl || 0), 0);

    return {
      id: `grp-${idx + 1}-${hotelName.replace(/[^a-z0-9]/gi, "").toLowerCase()}`,
      hotelName,
      hotelEmail,
      matchedHotelId: matched?.id,
      emailStatus,
      rows: hotelRows,
      tourNumber: hotelRows[0]?.tourNumber || "DZ-CUSTOM",
      reference: hotelRows[0]?.reference || "DIRECT",
      clientName: hotelRows[0]?.clientName || "Valued Guests",
      checkInStart: hotelRows[0]?.date || "Day 1",
      checkInEnd: hotelRows[hotelRows.length - 1]?.date || "Day 1",
      totalRooms: totalRooms > 0 ? totalRooms : 1,
      sendState: "idle",
    };
  });
}

/**
 * Generates a ready-to-use sample Excel spreadsheet for 1-click download & testing
 */
export async function generateSampleAccommodationExcel(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dodoz Leisure CRM";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Tour Accommodation Schedule");

  // Style Header Columns
  worksheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Tour Number", key: "tourNumber", width: 16 },
    { header: "Client Name", key: "clientName", width: 28 },
    { header: "Hotel Name", key: "hotel", width: 32 },
    { header: "Meal Plan", key: "mealPlan", width: 12 },
    { header: "SGL", key: "sgl", width: 8 },
    { header: "DBL", key: "dbl", width: 8 },
    { header: "TPL", key: "tpl", width: 8 },
    { header: "Room Category", key: "roomType", width: 24 },
    { header: "Special Requests & Notes", key: "specialRequest", width: 40 },
  ];

  // Apply visual styling to header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Navy
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 26;

  // Add realistic multi-hotel tour data
  const sampleRows = [
    {
      date: "2026-10-15",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "The Kingsbury Colombo",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Deluxe Ocean View",
      specialRequest: "Interconnecting rooms, VIP welcome drinks",
    },
    {
      date: "2026-10-16",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "The Kingsbury Colombo",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Deluxe Ocean View",
      specialRequest: "Late checkout preferred next morning",
    },
    {
      date: "2026-10-17",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Heritance Kandalama",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Superior Lake View",
      specialRequest: "Adjoining rooms, high floor with Sigiriya view",
    },
    {
      date: "2026-10-18",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Heritance Kandalama",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Superior Lake View",
      specialRequest: "Early packed breakfast for Sigiriya Rock climb",
    },
    {
      date: "2026-10-19",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Heritance Kandalama",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Superior Lake View",
      specialRequest: "Minneriya Safari return at 6:30 PM",
    },
    {
      date: "2026-10-20",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Anantara Peace Haven Tangalle Resort",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Premier Ocean View Room",
      specialRequest: "Complimentary fruit basket, anniversary flowers",
    },
    {
      date: "2026-10-21",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Anantara Peace Haven Tangalle Resort",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Premier Ocean View Room",
      specialRequest: "Ayurvedic spa appointment coordination",
    },
    {
      date: "2026-10-22",
      tourNumber: "DZ-2026-001",
      clientName: "Dr. Jonathan Hayes & Family",
      hotel: "Anantara Peace Haven Tangalle Resort",
      mealPlan: "HB",
      sgl: 0,
      dbl: 2,
      tpl: 0,
      roomType: "Premier Ocean View Room",
      specialRequest: "Private beachfront dinner",
    },
  ];

  sampleRows.forEach((r, idx) => {
    const row = worksheet.addRow(r);
    row.height = 20;
    row.font = { name: "Arial", size: 9 };
    row.alignment = { vertical: "middle" };

    // Alternate background row colors
    if (idx % 2 === 1) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
    }
  });

  // @ts-ignore
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
