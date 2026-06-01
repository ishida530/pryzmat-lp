import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  throw new Error(
    "Brak zmiennych środowiskowych SUPABASE_URL lub SUPABASE_SERVICE_KEY.\n" +
    "Skopiuj .env.example → .env.local i uzupełnij wartości z dashboardu Supabase."
  );
}

if (key.startsWith("sb_publishable_")) {
  throw new Error(
    "SUPABASE_SERVICE_KEY to klucz anon/publishable, a nie service_role.\n" +
    "Pobierz klucz 'service_role secret' z Supabase → Settings → API.\n" +
    "W nowym formacie Supabase zaczyna się od 'sb_secret_'."
  );
}

// Service-role client — server-side only, nigdy nie trafia do przeglądarki.
// Service key omija RLS, więc /api/sync może pisać do tabeli listings.
// Strony czytają przez te same credentials (serwer) — nie ma potrzeby klucza anon.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
