import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Brak zmiennej środowiskowej DATABASE_URL.\n" +
    "Skopiuj .env.example → .env.local i wklej connection string z Neon → Dashboard → Connect."
  );
}

// Klient HTTP Neona — server-side only, nigdy nie trafia do przeglądarki.
// Każde zapytanie to osobny request HTTP, więc nie ma problemu z pulą połączeń
// w funkcjach serverless na Vercelu.
//
// Użycie: sql`select * from listings where id = ${id}` (parametry są bezpiecznie
// bindowane) albo sql.query("select ... $1", [param]) dla dynamicznego SQL.
export const sql = neon(url);
