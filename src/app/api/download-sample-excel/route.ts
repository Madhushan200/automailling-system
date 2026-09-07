import { NextResponse } from "next/server";
import { generateSampleAccommodationExcel } from "@/lib/excel";

export async function GET() {
  try {
    const buffer = await generateSampleAccommodationExcel();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Dodoz_Accommodation_Schedule_Sample.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Failed to generate sample Excel:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
