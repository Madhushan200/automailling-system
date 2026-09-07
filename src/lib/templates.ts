export interface TemplateVariables {
  HOTEL_NAME?: string;
  CLIENT_NAME?: string;
  TOUR_NUMBER?: string;
  CHECK_IN?: string;
  CHECK_OUT?: string;
  REFERENCE?: string;
  TOTAL_ROOMS?: string | number;
  [key: string]: string | number | undefined;
}

export const TEMPLATE_TOKENS = [
  { token: "{{HOTEL_NAME}}", label: "Hotel Name", example: "The Kingsbury Colombo" },
  { token: "{{CLIENT_NAME}}", label: "Client / Group Name", example: "Alexander & Maria Schmidt" },
  { token: "{{TOUR_NUMBER}}", label: "Tour Number", example: "DZ-2026-089" },
  { token: "{{CHECK_IN}}", label: "Check-in Date", example: "2026-09-10" },
  { token: "{{CHECK_OUT}}", label: "Check-out Date", example: "2026-09-12" },
  { token: "{{REFERENCE}}", label: "Reference", example: "REF-SCH-01" },
  { token: "{{TOTAL_ROOMS}}", label: "Total Rooms", example: "2" },
];

/**
 * Replace placeholders like {{HOTEL_NAME}} in a string with actual data
 */
export function interpolateTemplate(template: string, vars: TemplateVariables): string {
  if (!template) return "";
  let result = template;
  
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder, "g");
    result = result.replace(regex, value !== undefined && value !== null ? String(value) : "");
  }
  
  return result;
}
