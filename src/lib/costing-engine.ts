import {
  QuotationAccommodationItem,
  QuotationTransportDay,
  QuotationMiscItem,
  QuotationCostingSummary,
  Vehicle,
  RoomTypeCategory,
} from "./types";

/**
 * Pure calculation engine converting Dodoz Leisure's COSTING SIMPLIFIED.xlsx
 * logic into an automated, flexible, and manual-override friendly calculation matrix.
 */

// 1. DATE CALCULATION (ARRIVAL + DEPARTURE DATES)
export function calculateTravelDates(
  arrivalDateStr?: string,
  departureDateStr?: string,
  manualNights?: number,
  manualDays?: number
): {
  nights: number;
  days: number;
  isNightsOverridden: boolean;
  isDaysOverridden: boolean;
} {
  let calculatedNights = 0;
  let calculatedDays = 0;

  if (arrivalDateStr && departureDateStr) {
    const arrival = new Date(arrivalDateStr);
    const departure = new Date(departureDateStr);
    if (!isNaN(arrival.getTime()) && !isNaN(departure.getTime()) && departure >= arrival) {
      const diffTime = Math.abs(departure.getTime() - arrival.getTime());
      calculatedNights = Math.round(diffTime / (1000 * 60 * 60 * 24));
      calculatedDays = calculatedNights + 1;
    }
  }

  const finalNights = manualNights !== undefined && manualNights !== null ? manualNights : (calculatedNights || 1);
  const finalDays = manualDays !== undefined && manualDays !== null ? manualDays : (calculatedDays || finalNights + 1 || 1);

  return {
    nights: Math.max(0, finalNights),
    days: Math.max(0, finalDays),
    isNightsOverridden: manualNights !== undefined && manualNights !== null && manualNights !== calculatedNights,
    isDaysOverridden: manualDays !== undefined && manualDays !== null && manualDays !== calculatedDays,
  };
}

// 2. PASSENGER CALCULATION
export function calculatePassengers(
  adults?: number,
  children?: number,
  infants?: number,
  manualTotalPax?: number
): {
  totalPax: number;
  adults: number;
  children: number;
  infants: number;
  isPaxOverridden: boolean;
} {
  const ad = Math.max(0, Number(adults) || 0);
  const ch = Math.max(0, Number(children) || 0);
  const inf = Math.max(0, Number(infants) || 0);
  const calculatedTotal = ad + ch + inf;

  const finalPax = manualTotalPax !== undefined && manualTotalPax !== null ? manualTotalPax : calculatedTotal;

  return {
    totalPax: Math.max(0, finalPax),
    adults: ad,
    children: ch,
    infants: inf,
    isPaxOverridden: manualTotalPax !== undefined && manualTotalPax !== null && manualTotalPax !== calculatedTotal,
  };
}

// 3. ACCOMMODATION COSTING (EXCEL FORMULA: SGL, DBL, TPL Room multipliers & PP rates)
export interface AccommodationCalculationResult {
  totalSglCost: number;
  totalDblCost: number;
  totalTplCost: number;
  totalOtherCost: number;
  totalAccommodationCost: number;
  sglPPRate: number;
  dblPPRate: number;
  tplPPRate: number;
  averagePPRate: number;
  itemBreakdowns: Array<{
    id: string;
    sglCost: number;
    dblCost: number;
    tplCost: number;
    otherCost: number;
    totalRowCost: number;
  }>;
}

export function calculateAccommodationCosting(
  items: QuotationAccommodationItem[],
  totalPax: number = 1,
  manualOverrideSglPP?: number,
  manualOverrideDblPP?: number,
  manualOverrideTplPP?: number
): AccommodationCalculationResult {
  let totalSgl = 0;
  let totalDbl = 0;
  let totalTpl = 0;
  let totalOther = 0;

  const breakdowns = (items || []).map((item) => {
    const nights = Math.max(1, Number(item.nights_count) || 1);
    const sglRooms = Number(item.sgl_rooms) || 0;
    const sglRate = Number(item.sgl_rate) || 0;
    const dblRooms = Number(item.dbl_rooms) || 0;
    const dblRate = Number(item.dbl_rate) || 0;
    const tplRooms = Number(item.tpl_rooms) || 0;
    const tplRate = Number(item.tpl_rate) || 0;
    const extraRooms = Number(item.extra_rooms) || 0;
    const extraRate = Number(item.extra_rate) || 0;

    // Excel: SGL Rate * SGL Rooms * Nights (or entered rate if already nightly)
    const sglCost = sglRooms * sglRate * (item.is_rate_per_night !== false ? nights : 1);
    const dblCost = dblRooms * dblRate * (item.is_rate_per_night !== false ? nights : 1);
    const tplCost = tplRooms * tplRate * (item.is_rate_per_night !== false ? nights : 1);
    const otherCost = extraRooms * extraRate * (item.is_rate_per_night !== false ? nights : 1);

    totalSgl += sglCost;
    totalDbl += dblCost;
    totalTpl += tplCost;
    totalOther += otherCost;

    return {
      id: item.id,
      sglCost,
      dblCost,
      tplCost,
      otherCost,
      totalRowCost: sglCost + dblCost + tplCost + otherCost,
    };
  });

  const totalAccom = totalSgl + totalDbl + totalTpl + totalOther;

  // Excel PP formulas:
  // SGL PP = SGL Total / 1
  // DBL PP = DBL Total / 2
  // TPL PP = TPL Total / 3
  const calcSglPP = totalSgl > 0 ? totalSgl : 0;
  const calcDblPP = totalDbl > 0 ? totalDbl / 2 : 0;
  const calcTplPP = totalTpl > 0 ? totalTpl / 3 : 0;
  const avgPP = totalPax > 0 ? totalAccom / totalPax : 0;

  return {
    totalSglCost: totalSgl,
    totalDblCost: totalDbl,
    totalTplCost: totalTpl,
    totalOtherCost: totalOther,
    totalAccommodationCost: totalAccom,
    sglPPRate: manualOverrideSglPP ?? calcSglPP,
    dblPPRate: manualOverrideDblPP ?? calcDblPP,
    tplPPRate: manualOverrideTplPP ?? calcTplPP,
    averagePPRate: avgPP,
    itemBreakdowns: breakdowns,
  };
}

// 4. TRANSPORTATION COSTING (EXCEL FORMULA: KM * Per KM Rate + Driver Batta + Guide Fees + Highway Tickets + Driver Accom)
export interface TransportCalculationResult {
  calculatedKM: number;
  totalKM: number;
  isKMOverridden: boolean;
  baseVehicleCostLKR: number;
  driverBattaLKR: number;
  guideFeesLKR: number;
  highwayTicketsLKR: number;
  airportTicketsLKR: number;
  driverAccomLKR: number;
  otherTransportCostsLKR: number;
  totalTransportLKR: number;
  exchangeRateUSD: number;
  totalTransportUSD: number;
  transportPPRateUSD: number;
  selectedVehicle?: Vehicle;
  capacityWarning?: string;
}

export function calculateTransportationCosting(
  transportDays: QuotationTransportDay[],
  vehicle?: Vehicle,
  numVehicles: number = 1,
  totalPax: number = 5,
  exchangeRateLKRPerUSD: number = 325,
  manualTotalKM?: number,
  manualOverrideTransportUSD?: number
): TransportCalculationResult {
  const calculatedKM = (transportDays || []).reduce((sum, d) => sum + (Number(d.km) || 0), 0);
  const totalKM = manualTotalKM !== undefined && manualTotalKM !== null ? manualTotalKM : calculatedKM;
  const isKMOverridden = manualTotalKM !== undefined && manualTotalKM !== null && manualTotalKM !== calculatedKM;

  const perKmRate = vehicle?.per_km_rate || 140; // Default 140 LKR/KM from Excel
  const daysCount = Math.max(1, transportDays.length || 1);

  // Sum day-by-day additional transport allowances or use defaults
  let customDriverBatta = 0;
  let customGuideFees = 0;
  let customHighwayTickets = 0;
  let customAirportTickets = 0;
  let customDriverAccom = 0;
  let customOther = 0;

  let hasCustomAllowances = false;
  transportDays.forEach((d) => {
    if (d.driver_batta !== undefined) {
      customDriverBatta += Number(d.driver_batta) || 0;
      hasCustomAllowances = true;
    }
    if (d.guide_fee !== undefined) {
      customGuideFees += Number(d.guide_fee) || 0;
      hasCustomAllowances = true;
    }
    if (d.highway_ticket !== undefined) {
      customHighwayTickets += Number(d.highway_ticket) || 0;
      hasCustomAllowances = true;
    }
    if (d.airport_ticket !== undefined) {
      customAirportTickets += Number(d.airport_ticket) || 0;
      hasCustomAllowances = true;
    }
    if (d.driver_accom !== undefined) {
      customDriverAccom += Number(d.driver_accom) || 0;
      hasCustomAllowances = true;
    }
    if (d.other_cost !== undefined) {
      customOther += Number(d.other_cost) || 0;
      hasCustomAllowances = true;
    }
  });

  // Base Vehicle Cost: Total KM * Per KM Rate * Num Vehicles
  const baseVehicleCostLKR = totalKM * perKmRate * Math.max(1, numVehicles);

  // Default allowances if not specifically listed per day (from Excel reference)
  const driverBattaLKR = hasCustomAllowances ? customDriverBatta : (vehicle?.driver_daily_allowance || 2500) * daysCount;
  const guideFeesLKR = hasCustomAllowances ? customGuideFees : 5000;
  const highwayTicketsLKR = hasCustomAllowances ? customHighwayTickets : 1000;
  const airportTicketsLKR = hasCustomAllowances ? customAirportTickets : 1000;
  const driverAccomLKR = hasCustomAllowances ? customDriverAccom : (vehicle?.driver_accommodation_rate || 5000);
  const otherTransportCostsLKR = customOther;

  const totalTransportLKR =
    baseVehicleCostLKR +
    driverBattaLKR +
    guideFeesLKR +
    highwayTicketsLKR +
    airportTicketsLKR +
    driverAccomLKR +
    otherTransportCostsLKR;

  const rateUSD = exchangeRateLKRPerUSD > 0 ? exchangeRateLKRPerUSD : 325;
  const calculatedTransportUSD = totalTransportLKR / rateUSD;
  const finalTransportUSD = manualOverrideTransportUSD !== undefined && manualOverrideTransportUSD !== null
    ? manualOverrideTransportUSD
    : calculatedTransportUSD;

  const transportPP = totalPax > 0 ? finalTransportUSD / totalPax : 0;

  // Capacity Warning Check
  let capacityWarning: string | undefined = undefined;
  if (vehicle && vehicle.seats) {
    const totalCapacity = vehicle.seats * Math.max(1, numVehicles);
    if (totalPax > totalCapacity) {
      capacityWarning = `Passenger count (${totalPax} Pax) exceeds selected vehicle capacity (${totalCapacity} Seats across ${numVehicles} vehicle${numVehicles > 1 ? "s" : ""}).`;
    }
  }

  return {
    calculatedKM,
    totalKM,
    isKMOverridden,
    baseVehicleCostLKR,
    driverBattaLKR,
    guideFeesLKR,
    highwayTicketsLKR,
    airportTicketsLKR,
    driverAccomLKR,
    otherTransportCostsLKR,
    totalTransportLKR,
    exchangeRateUSD: rateUSD,
    totalTransportUSD: finalTransportUSD,
    transportPPRateUSD: transportPP,
    selectedVehicle: vehicle,
    capacityWarning,
  };
}

// 5. MISCELLANEOUS & ENTRANCE FEES COSTING (EXCEL FORMULA: Sum of individual items)
export interface MiscCalculationResult {
  totalMiscCost: number;
  miscPPRate: number;
  itemBreakdowns: Array<{
    id: string;
    item: string;
    category?: string;
    unit: string;
    qty: number;
    unitRate: number;
    totalCost: number;
    isPerPerson: boolean;
  }>;
}

export function calculateMiscellaneousCosting(
  items: QuotationMiscItem[],
  totalPax: number = 5,
  manualOverrideMiscTotal?: number
): MiscCalculationResult {
  let computedTotal = 0;

  const breakdowns = (items || []).map((m) => {
    const qty = Number(m.qty) || 1;
    const rate = Number(m.rate) || 0;
    const isPP = m.is_per_person !== false; // Most entrance fees are PP in Excel

    // If item is per-person, total cost for group is Rate * Qty * Pax (or Rate * Pax if Qty is 1)
    const rowCost = isPP ? rate * qty * (totalPax > 0 ? totalPax : 1) : rate * qty;
    computedTotal += rowCost;

    return {
      id: m.id,
      item: m.item,
      category: m.category,
      unit: m.unit || (isPP ? "Per Person" : "Per Group"),
      qty,
      unitRate: rate,
      totalCost: rowCost,
      isPerPerson: isPP,
    };
  });

  const finalTotal = manualOverrideMiscTotal !== undefined && manualOverrideMiscTotal !== null
    ? manualOverrideMiscTotal
    : computedTotal;

  const miscPP = totalPax > 0 ? finalTotal / totalPax : 0;

  return {
    totalMiscCost: finalTotal,
    miscPPRate: miscPP,
    itemBreakdowns: breakdowns,
  };
}

// 6. MASTER CONSOLIDATED COSTING SUMMARY (EXCEL FULL FINANCIAL MATRIX)
export function calculateFullQuotationCosting(params: {
  accommodationItems: QuotationAccommodationItem[];
  transportDays: QuotationTransportDay[];
  miscItems: QuotationMiscItem[];
  vehicle?: Vehicle;
  numVehicles?: number;
  totalPax?: number;
  exchangeRateLKRPerUSD?: number;
  markupType?: "percentage" | "fixed";
  markupValue?: number;
  discountAmount?: number;
  taxPercent?: number;
  currency?: string;
  manualOverrides?: {
    sglPP?: number;
    dblPP?: number;
    tplPP?: number;
    totalKM?: number;
    transportUSD?: number;
    miscTotal?: number;
    finalSellingPrice?: number;
    finalPPRate?: number;
  };
}): QuotationCostingSummary {
  const pax = Math.max(1, params.totalPax || 1);
  const overrides = params.manualOverrides || {};

  // 1. Calculate Accom
  const accom = calculateAccommodationCosting(
    params.accommodationItems,
    pax,
    overrides.sglPP,
    overrides.dblPP,
    overrides.tplPP
  );

  // 2. Calculate Transport
  const transport = calculateTransportationCosting(
    params.transportDays,
    params.vehicle,
    params.numVehicles || 1,
    pax,
    params.exchangeRateLKRPerUSD || 325,
    overrides.totalKM,
    overrides.transportUSD
  );

  // 3. Calculate Misc
  const misc = calculateMiscellaneousCosting(params.miscItems, pax, overrides.miscTotal);

  // 4. Net Cost of Sales
  const netCostSubtotal = accom.totalAccommodationCost + transport.totalTransportUSD + misc.totalMiscCost;
  const netCostPP = pax > 0 ? netCostSubtotal / pax : 0;

  // 5. Markup Calculation
  const markupType = params.markupType || "fixed";
  const markupVal = Number(params.markupValue) || (markupType === "fixed" ? 20 : 15); // Default $20 PP or 15%
  let totalMarkupAmount = 0;
  let markupPPAmount = 0;

  if (markupType === "percentage") {
    totalMarkupAmount = (netCostSubtotal * markupVal) / 100;
    markupPPAmount = pax > 0 ? totalMarkupAmount / pax : 0;
  } else {
    // Fixed amount per person
    markupPPAmount = markupVal;
    totalMarkupAmount = markupVal * pax;
  }

  // 6. Discounts & Taxes
  const discount = Number(params.discountAmount) || 0;
  const taxPct = Number(params.taxPercent) || 0;
  const grossBeforeTax = Math.max(0, netCostSubtotal + totalMarkupAmount - discount);
  const taxAmount = (grossBeforeTax * taxPct) / 100;
  const calculatedSellingPrice = grossBeforeTax + taxAmount;

  // 7. Final Selling Price & PP
  const finalSellingPrice = overrides.finalSellingPrice !== undefined && overrides.finalSellingPrice !== null
    ? overrides.finalSellingPrice
    : calculatedSellingPrice;

  const calculatedPPRate = pax > 0 ? finalSellingPrice / pax : 0;
  const finalPPRate = overrides.finalPPRate !== undefined && overrides.finalPPRate !== null
    ? overrides.finalPPRate
    : calculatedPPRate;

  // 8. Room-Type-Specific Selling Rates (Excel Rows 41-52)
  // SGL PP = SGL_PP + Transport_PP + Misc_PP + Markup_PP
  // DBL PP = DBL_PP + Transport_PP + Misc_PP + Markup_PP
  // TPL PP = TPL_PP + Transport_PP + Misc_PP + Markup_PP
  const sglSellingPP = accom.sglPPRate + transport.transportPPRateUSD + misc.miscPPRate + markupPPAmount;
  const dblSellingPP = accom.dblPPRate + transport.transportPPRateUSD + misc.miscPPRate + markupPPAmount;
  const tplSellingPP = accom.tplPPRate + transport.transportPPRateUSD + misc.miscPPRate + markupPPAmount;

  // 9. Gross Profit & Margin
  const grossProfit = finalSellingPrice - netCostSubtotal;
  const grossMarginPercent = finalSellingPrice > 0 ? (grossProfit / finalSellingPrice) * 100 : 0;

  return {
    currency: params.currency || "USD",
    totalPax: pax,

    // Accom
    accommodationTotal: accom.totalAccommodationCost,
    sglCostPP: accom.sglPPRate,
    dblCostPP: accom.dblPPRate,
    tplCostPP: accom.tplPPRate,

    // Transport
    transportTotalUSD: transport.totalTransportUSD,
    transportTotalLKR: transport.totalTransportLKR,
    totalKM: transport.totalKM,
    transportCostPP: transport.transportPPRateUSD,

    // Misc
    miscTotal: misc.totalMiscCost,
    miscCostPP: misc.miscPPRate,

    // Net
    netCostSubtotal,
    netCostPP,

    // Markup & Profit
    markupType,
    markupValue: markupVal,
    totalMarkupAmount,
    markupPPAmount,
    discountAmount: discount,
    taxPercent: taxPct,
    taxAmount,
    grossProfit,
    grossMarginPercent,

    // Final Selling
    finalSellingPrice,
    finalPPRate,

    // Package PP by Room Type
    sglSellingPP,
    dblSellingPP,
    tplSellingPP,

    // Indicators
    isPriceOverridden: overrides.finalSellingPrice !== undefined && overrides.finalSellingPrice !== null && overrides.finalSellingPrice !== calculatedSellingPrice,
    isPPRateOverridden: overrides.finalPPRate !== undefined && overrides.finalPPRate !== null && overrides.finalPPRate !== calculatedPPRate,
    capacityWarning: transport.capacityWarning,
  };
}
