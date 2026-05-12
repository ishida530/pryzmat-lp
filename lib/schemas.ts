import { z } from "zod";

const phoneRegex = /^[+\d][\d\s()\-]{7,}$/;

export const leadFormSchema = z.object({
  imie: z.string().min(2, "Podaj imię (min. 2 znaki)"),
  telefon: z
    .string()
    .min(9, "Podaj poprawny numer telefonu")
    .regex(phoneRegex, "Podaj poprawny numer telefonu"),
  rodzajNieruchomosci: z.enum(["mieszkanie", "dom", "dzialka", "inne"], {
    errorMap: () => ({ message: "Wybierz rodzaj nieruchomości" }),
  }),
  cel: z.enum(["sprzedaz", "wynajem", "zarzadzanie"], {
    errorMap: () => ({ message: "Wybierz cel" }),
  }),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const contactFormSchema = z.object({
  imie: z.string().min(2, "Podaj imię (min. 2 znaki)"),
  telefon: z
    .string()
    .min(9, "Podaj poprawny numer telefonu")
    .regex(phoneRegex, "Podaj poprawny numer telefonu"),
  email: z
    .string()
    .email("Podaj poprawny adres email")
    .optional()
    .or(z.literal("")),
  szukasz: z.enum(["kupno", "sprzedaz", "wynajem", "zarzadzanie", "inne"], {
    errorMap: () => ({ message: "Wybierz czego szukasz" }),
  }),
  wiadomosc: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
