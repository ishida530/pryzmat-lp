import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/constants";

const fieldLabels: Record<string, string> = {
  imie: "Imię",
  telefon: "Telefon",
  email: "E-mail",
  szukasz: "Czego szuka",
  cel: "Cel",
  rodzajNieruchomosci: "Rodzaj nieruchomości",
  wiadomosc: "Wiadomość",
  source: "Źródło formularza",
};

function buildHtml(body: Record<string, string>, subject: string): string {
  const rows = Object.entries(body)
    .filter(([, v]) => v && v !== "undefined")
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:6px 16px 6px 0;font-weight:600;color:#1B3A6B;white-space:nowrap;vertical-align:top">
            ${fieldLabels[k] ?? k}
          </td>
          <td style="padding:6px 0;color:#374151">${v}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#1B3A6B;padding:24px 32px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:12px">
        <div style="width:6px;height:40px;background:#C0392B;border-radius:3px"></div>
        <div>
          <p style="color:#fff;font-size:18px;font-weight:800;margin:0;line-height:1.2">
            PRYZMAT — nowe zgłoszenie
          </p>
          <p style="color:#93c5fd;font-size:13px;margin:4px 0 0">${subject}</p>
        </div>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 10px 10px;background:#fff">
        <table style="border-collapse:collapse;width:100%">
          ${rows}
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0" />
        <p style="margin:0;font-size:11px;color:#9ca3af">
          Wiadomość z formularza kontaktowego na
          <a href="${COMPANY.website}" style="color:#2E6EC5">${COMPANY.website}</a>
          · ${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
        </p>
      </div>
    </div>
  `;
}

function buildText(body: Record<string, string>): string {
  return Object.entries(body)
    .filter(([, v]) => v && v !== "undefined")
    .map(([k, v]) => `${fieldLabels[k] ?? k}: ${v}`)
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json();

    if (!body.imie || !body.telefon) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól." },
        { status: 400 }
      );
    }

    const isHeroLead = body.source === "hero_lead";
    const subject = isHeroLead
      ? `Nowe zlecenie (Hero) — ${body.imie}, tel. ${body.telefon}`
      : `Nowe zapytanie — ${body.imie}, tel. ${body.telefon}`;

    const smtpReady =
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (smtpReady) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Formularz PRYZMAT" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO ?? COMPANY.email,
        replyTo: body.email || undefined,
        subject,
        html: buildHtml(body, subject),
        text: buildText(body),
      });
    } else {
      // Fallback: log to console when SMTP is not configured (dev / staging)
      console.warn(
        "[KONTAKT] SMTP nie skonfigurowany — zgłoszenie tylko w logach."
      );
      console.log(
        `[KONTAKT] ${new Date().toISOString()}\n`,
        buildText(body)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[KONTAKT] Błąd przetwarzania zgłoszenia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
