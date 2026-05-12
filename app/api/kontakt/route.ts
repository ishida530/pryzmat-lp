import { NextRequest, NextResponse } from "next/server";
import { COMPANY } from "@/lib/constants";

// PRODUCTION: Uncomment and configure nodemailer
// import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic sanity check — zod validates on the client, double-check here
    if (!body.imie || !body.telefon) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól." },
        { status: 400 }
      );
    }

    // Log to console — replace with email send in production
    console.log(
      `[KONTAKT] ${new Date().toISOString()} — nowe zgłoszenie:`,
      JSON.stringify(body, null, 2)
    );

    // PRODUCTION: Configure nodemailer with SMTP
    //
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT) || 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    //
    // const subject =
    //   body.source === "hero_lead"
    //     ? `Nowe zlecenie z formularza Hero — ${body.imie}`
    //     : `Nowe zapytanie z formularza — ${body.imie}`;
    //
    // const text = Object.entries(body)
    //   .map(([k, v]) => `${k}: ${v}`)
    //   .join("\n");
    //
    // await transporter.sendMail({
    //   from: `"Formularz PRYZMAT" <${process.env.SMTP_FROM || "noreply@pryzmat.com.pl"}>`,
    //   to: COMPANY.email,
    //   replyTo: body.email || undefined,
    //   subject,
    //   text,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[KONTAKT] Błąd przetwarzania zgłoszenia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
