import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

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

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

// Proxy — walidacja następuje przy pierwszym wywołaniu metody, nie przy imporcie modułu.
// Dzięki temu build nie failuje gdy zmienne są ustawione tylko w Vercel env vars.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
