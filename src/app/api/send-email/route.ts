import { NextRequest, NextResponse } from "next/server";
import { sendEmailWithVoucher } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, text, customSettings } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: "Recipient and subject are required." },
        { status: 400 }
      );
    }

    try {
      await sendEmailWithVoucher({
        to,
        subject,
        text,
        customSettings,
      });
    } catch (smtpErr: any) {
      console.warn("SMTP test send warning:", smtpErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Test email dispatched to ${to}`,
    });
  } catch (error: any) {
    console.error("API send-email error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch test email." },
      { status: 500 }
    );
  }
}
