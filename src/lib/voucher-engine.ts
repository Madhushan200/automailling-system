import { Tour, Hotel, AccommodationRow, GroupedHotelVoucher } from "./types";

/**
 * Normalizes a hotel name string for matching.
 */
export function normalizeHotelName(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds matching hotel in master database.
 */
export function findMatchingHotel(hotelName: string, knownHotels: Hotel[]): Hotel | undefined {
  if (!hotelName || !knownHotels || knownHotels.length === 0) return undefined;

  const target = normalizeHotelName(hotelName);
  if (!target) return undefined;

  // 1. Exact match (case-insensitive)
  const exact = knownHotels.find((h) => normalizeHotelName(h.hotel_name) === target);
  if (exact) return exact;

  // 2. Substring contains match
  const contains = knownHotels.find((h) => {
    const hNorm = normalizeHotelName(h.hotel_name);
    return hNorm.includes(target) || target.includes(hNorm);
  });
  if (contains) return contains;

  // 3. Word token overlap match
  const targetWords = target.split(" ").filter((w) => w.length > 2);
  if (targetWords.length > 0) {
    const wordMatch = knownHotels.find((h) => {
      const hNorm = normalizeHotelName(h.hotel_name);
      return targetWords.some((w) => hNorm.includes(w));
    });
    if (wordMatch) return wordMatch;
  }

  return undefined;
}

/**
 * Automatically detects every unique hotel from the accommodation table,
 * matches hotel contact details from the Master Hotel Database,
 * and creates one isolated voucher for each unique hotel.
 */
export function generateHotelVouchers(
  tour: Tour,
  knownHotels: Hotel[],
  existingVouchers?: GroupedHotelVoucher[]
): GroupedHotelVoucher[] {
  const rows = tour.accommodation_rows || [];
  if (rows.length === 0) return [];

  // 1. Group rows by unique hotel name
  const hotelGroups = new Map<string, AccommodationRow[]>();

  for (const row of rows) {
    const rawHotel = (row.hotel || row.hotelName || "").trim();
    if (!rawHotel) continue;

    const groupKey = rawHotel.toUpperCase();
    if (!hotelGroups.has(groupKey)) {
      hotelGroups.set(groupKey, []);
    }
    hotelGroups.get(groupKey)!.push({
      ...row,
      hotel: rawHotel,
      hotelName: rawHotel,
    });
  }

  // 2. Build one voucher per hotel
  const vouchers: GroupedHotelVoucher[] = [];

  hotelGroups.forEach((hotelRows, hotelKey) => {
    const hotelName = hotelRows[0]?.hotel || hotelKey;
    const matched = findMatchingHotel(hotelName, knownHotels);

    // Check if we already have an existing voucher state for this hotel
    const existing = existingVouchers?.find(
      (v) => normalizeHotelName(v.hotelName) === normalizeHotelName(hotelName)
    );

    const hotelEmail =
      existing?.hotelEmail ||
      hotelRows.find((r) => r.hotelEmail)?.hotelEmail ||
      matched?.reservation_email ||
      "";

    const totalRooms = hotelRows.reduce(
      (acc, r) => acc + (Number(r.sgl) || 0) + (Number(r.dbl) || 0) + (Number(r.tpl) || 0),
      0
    );

    const dates = hotelRows.map((r) => r.date).filter(Boolean);
    const checkInStart = dates[0] || tour.start_date || tour.arrival_date || "—";
    const checkInEnd = dates[dates.length - 1] || tour.end_date || tour.departure_date || "—";

    vouchers.push({
      id: existing?.id || `vch-${tour.tour_number || tour.id}-${hotelKey.replace(/[^A-Z0-9]/g, "")}-${Date.now().toString().slice(-4)}`,
      hotelName,
      hotelEmail,
      matchedHotelId: matched?.id,
      emailStatus: hotelEmail ? (matched ? "matched" : "custom") : "missing",
      rows: hotelRows,
      tourNumber: tour.tour_number || tour.tour_reference || "DL-2026-001",
      reference: tour.tour_reference || tour.tour_number || "DL-2026-001",
      clientName: tour.client_name || "Valued Guests",
      checkInStart,
      checkInEnd,
      totalRooms: totalRooms > 0 ? totalRooms : (Number(tour.total_pax) || 1),
      sendState: existing?.sendState || "idle",
      sendErrorMessage: existing?.sendErrorMessage,
      lastSentAt: existing?.lastSentAt,
    });
  });

  return vouchers;
}
