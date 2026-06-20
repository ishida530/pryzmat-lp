import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/constants";

const TYP_LABELS: Record<string, string> = {
  deweloper:        "Deweloper",
  inwestor_prywatny:"Inwestor prywatny",
  fundusz:          "Fundusz inwestycyjny",
  inne:             "Inne",
};

function buildHtml(body: Record<string, string>): string {
  const typ = TYP_LABELS[body.typ] ?? body.typ ?? "—";

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#072b7f;padding:24px 32px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:12px">
        <div style="width:6px;height:44px;background:#9a7b3a;border-radius:3px;flex-shrink:0"></div>
        <div>
          <p style="color:#fff;font-size:18px;font-weight:800;margin:0;line-height:1.2">
            PRYZMAT — Lead inwestycyjny
          </p>
          <p style="color:#9a7b3a;font-size:12px;margin:5px 0 0;letter-spacing:0.1em;text-transform:uppercase">
            Barczewo · ul. Słowackiego 2i
          </p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 10px 10px;background:#fff">
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr>
            <td style="padding:8px 16px 8px 0;font-weight:600;color:#072b7f;white-space:nowrap;vertical-align:top;width:38%">Imię i nazwisko</td>
            <td style="padding:8px 0;color:#374151">${body.imie ?? "—"}</td>
          </tr>
          <tr style="background:#f9f7f3">
            <td style="padding:8px 16px 8px 0;font-weight:600;color:#072b7f;white-space:nowrap;vertical-align:top">Telefon</td>
            <td style="padding:8px 0;color:#374151">${body.telefon ?? "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 16px 8px 0;font-weight:600;color:#072b7f;white-space:nowrap;vertical-align:top">E-mail</td>
            <td style="padding:8px 0;color:#374151">${body.email ?? "—"}</td>
          </tr>
          <tr style="background:#f9f7f3">
            <td style="padding:8px 16px 8px 0;font-weight:600;color:#072b7f;white-space:nowrap;vertical-align:top">Typ inwestora</td>
            <td style="padding:8px 0;color:#374151">${typ}</td>
          </tr>
        </table>

        <div style="margin-top:20px;padding:14px 16px;background:#f0f4f9;border-radius:6px;border-left:3px solid #9a7b3a">
          <p style="margin:0;font-size:12px;color:#2d3250;line-height:1.6">
            <strong>Oferta:</strong> Barczewo, działka 393/11 — zabudowa wielorodzinna, 80 mieszkań, MPZP B50MW<br/>
            <strong>Cena działki:</strong> 1 700 000 zł · <strong>PUM:</strong> 4 290 m²
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0" />
        <p style="margin:0;font-size:11px;color:#9ca3af">
          Formularz kontaktowy z
          <a href="${COMPANY.website}/inwestycja-barczewo" style="color:#2E6EC5">
            pryzmatnieruchomosci.pl/inwestycja-barczewo
          </a>
          · ${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
        </p>
      </div>
    </div>
  `;
}

function buildText(body: Record<string, string>): string {
  const typ = TYP_LABELS[body.typ] ?? body.typ ?? "—";
  return [
    "=== LEAD INWESTYCYJNY — BARCZEWO ===",
    `Imię:     ${body.imie}`,
    `Telefon:  ${body.telefon}`,
    `E-mail:   ${body.email}`,
    `Typ:      ${typ}`,
    "",
    "Oferta: działka 393/11 Barczewo, 80 mieszkań, MPZP B50MW",
  ].join("\n");
}

async function createAsariLead(body: Record<string, string>) {
  const userId = process.env.ASARI_USER_ID;
  const token  = process.env.ASARI_TOKEN;
  if (!userId || !token) return;

  try {
    const nameParts = (body.imie ?? "").trim().split(/\s+/);
    const firstName = nameParts[0] ?? body.imie;
    const lastName  = nameParts.slice(1).join(" ") || undefined;

    const params = new URLSearchParams();
    params.set("customerType",          "Lead");
    params.set("firstName",             firstName);
    if (lastName) params.set("lastName", lastName);
    params.set("customerFrom",          "Internet");
    params.set("phones[0].phoneNumber", body.telefon ?? "");
    if (body.email) params.set("emails[0].email", body.email);

    const res = await fetch("https://api.asari.pro/site/customer/create", {
      method:  "POST",
      headers: {
        "SiteAuth":     `${userId}:${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      console.warn("[ASARI barczewo] HTTP", res.status, await res.text());
    } else {
      const json = await res.json();
      if (json.success) {
        console.log("[ASARI barczewo] lead created, id:", json.data);
      } else {
        console.warn("[ASARI barczewo] API error:", json.error);
      }
    }
  } catch (err) {
    console.warn("[ASARI barczewo] request failed:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json();

    if (!body.imie || !body.telefon || !body.email) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól (imię, telefon, email)." },
        { status: 400 }
      );
    }

    const subject = `[BARCZEWO] Lead inwestycyjny — ${body.imie}, ${TYP_LABELS[body.typ] ?? body.typ}, tel. ${body.telefon}`;

    const smtpReady =
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (smtpReady) {
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // ─── Email do biura ───
      await transporter.sendMail({
        from:    `"Formularz PRYZMAT" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to:      process.env.SMTP_TO || "biuro@marzdom.pl",
        replyTo: body.email || undefined,
        subject,
        html:    buildHtml(body),
        text:    buildText(body),
      });

      // ─── Email do użytkownika (potwierdzenie + linki do dokumentów) ───
      const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pryzmatnieruchomosci.pl";

      const dokumentyHtml = `
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/pzt-koncepcja-plansza-1.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Plan zagospodarowania terenu
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">Koncepcja — Plansza 1</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/a1-rzut-parteru-plansza-3.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Rzut parteru z metrażami
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">Plansza 3</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/a2-rzut-kondygnacji-plansza-4.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Rzut powtarzalnej kondygnacji
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">Plansza 4</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/p1-rzut-garazu.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Rzut garażu podziemnego
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">41 miejsc postojowych</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/mpzp-barczewo.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Wypis z MPZP
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">B50MW Barczewo</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <a href="${BASE_URL}/docs/mapa-podzial-barczewo-393-1.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Mapa podziału działki
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">393/11 — gotowy geodezyjnie</span>
          </td></tr>
          <tr><td style="padding:8px 0;">
            <a href="${BASE_URL}/docs/oferta-dla-deweloperow.pdf"
               style="color:#1B3A6B;font-weight:600;text-decoration:none;">
              📄 Oryginalna oferta inwestycyjna
            </a>
            <span style="color:#6b7280;font-size:13px;display:block;">List Jerzego Sawczuka</span>
          </td></tr>
        </table>
      `;

      const userEmailHtml = `
        <!DOCTYPE html>
        <html lang="pl">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f9f7f3;font-family:Arial,sans-serif;">
          <table style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#1B3A6B;padding:28px 32px;">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.02em;">
                  PRYZMAT Biuro Nieruchomości
                </p>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">
                  Barczewko 126B · Barczewo
                </p>
              </td>
            </tr>
            <tr><td style="background:#C0392B;height:3px;padding:0;"></td></tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;line-height:1.3;">
                  Dziękujemy za zainteresowanie<br>inwestycją w Barczewie.
                </p>
                <p style="margin:16px 0;color:#2d3250;font-size:15px;line-height:1.7;">
                  Szanowny/a <strong>${body.imie}</strong>,<br><br>
                  otrzymaliśmy Państwa zapytanie. Skontaktujemy się w ciągu 2 godzin
                  w godzinach pracy biura.
                </p>
                <p style="margin:0 0 24px;color:#2d3250;font-size:15px;line-height:1.7;">
                  Poniżej pełna dokumentacja techniczna projektu — do pobrania
                  bezpośrednio z linków:
                </p>
                <div style="background:#f2efe8;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
                  <p style="margin:0 0 14px;color:#9a7b3a;font-size:11px;font-weight:700;
                            text-transform:uppercase;letter-spacing:0.1em;">
                    Dokumentacja do pobrania
                  </p>
                  ${dokumentyHtml}
                </div>
                <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
                  <p style="margin:0 0 6px;color:#7a7d94;font-size:12px;
                            text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
                    Kontakt bezpośredni
                  </p>
                  <p style="margin:0;color:#1a1a2e;font-size:15px;font-weight:700;">
                    Jerzy Sawczuk
                  </p>
                  <p style="margin:4px 0 0;color:#2d3250;font-size:14px;">
                    <a href="tel:+48607677034" style="color:#1B3A6B;text-decoration:none;">
                      +48 607 677 034
                    </a>
                    &nbsp;·&nbsp;
                    <a href="mailto:biuro@marzdom.pl" style="color:#1B3A6B;text-decoration:none;">
                      biuro@marzdom.pl
                    </a>
                  </p>
                  <p style="margin:8px 0 0;color:#7a7d94;font-size:13px;">
                    Pon–Pt 9:00–20:00 · Sob 10:00–15:00 · Niedz 9:00–16:00
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f2efe8;padding:16px 32px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  PRYZMAT Biuro Nieruchomości · Barczewko 126B, 11-010 Barczewo<br>
                  <a href="${BASE_URL}/inwestycja-barczewo"
                     style="color:#1B3A6B;text-decoration:none;">
                    ${BASE_URL}/inwestycja-barczewo
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const recipientEmail = process.env.NODE_ENV === "production"
        ? body.email
        : "pawel.sawczuk.email@gmail.com";

      await transporter.sendMail({
        from:    `"PRYZMAT Biuro Nieruchomości" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to:      recipientEmail,
        replyTo: "biuro@marzdom.pl",
        subject: "Dokumentacja inwestycji Barczewo — PRYZMAT",
        html:    userEmailHtml,
        text: [
          `Szanowny/a ${body.imie},`,
          "",
          "Dziekujemy za zainteresowanie inwestycja w Barczewie.",
          "Skontaktujemy sie w ciagu 2 godzin w godzinach pracy biura.",
          "",
          "DOKUMENTACJA DO POBRANIA:",
          `${BASE_URL}/docs/pzt-koncepcja-plansza-1.pdf`,
          `${BASE_URL}/docs/a1-rzut-parteru-plansza-3.pdf`,
          `${BASE_URL}/docs/a2-rzut-kondygnacji-plansza-4.pdf`,
          `${BASE_URL}/docs/p1-rzut-garazu.pdf`,
          `${BASE_URL}/docs/mpzp-barczewo.pdf`,
          `${BASE_URL}/docs/mapa-podzial-barczewo-393-1.pdf`,
          `${BASE_URL}/docs/oferta-dla-deweloperow.pdf`,
          "",
          "Kontakt: Jerzy Sawczuk, tel. +48 607 677 034, biuro@marzdom.pl",
          "Pon-Pt 9:00-20:00 | Sob 10:00-15:00 | Niedz 9:00-16:00",
          "",
          "PRYZMAT Biuro Nieruchomosci · Barczewko 126B, 11-010 Barczewo",
        ].join("\n"),
      });
    } else {
      console.warn("[BARCZEWO] SMTP not configured — lead logged only.");
      console.log(`[BARCZEWO LEAD] ${new Date().toISOString()}\n`, buildText(body));
    }

    // Fire-and-forget CRM
    createAsariLead(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BARCZEWO] Error processing lead:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
