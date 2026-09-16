import { NextRequest, NextResponse } from "next/server";
import { getVoucherPDFBuffer } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as any;
    const pdfBuffer = getVoucherPDFBuffer(data);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Hotel_Voucher_${data.hotelName || "Voucher"}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
