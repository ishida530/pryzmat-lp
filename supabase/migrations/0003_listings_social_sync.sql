-- ============================================================
-- Social intake tracking dla nowych ofert (2026-09-23)
--
-- social_post_synced_at: null = oferta jeszcze nie zgłoszona do Postfly, albo zgłoszenie się nie
-- powiodło (retry przy kolejnym /api/sync, niezależnie od tego czy dane oferty w ogóle się
-- zmieniły od ostatniego syncu). Ustawiane wyłącznie po udanym wywołaniu Postfly.
--
-- parent_listing_id: id oferty-rodzica z ASARI (pole `parentListing`), jeśli ta oferta jest
-- pojedynczym lokalem w ramach inwestycji. Używane wyłącznie do pominięcia takich ofert przy
-- generowaniu postów social — post ma iść tylko dla samej inwestycji (rodzica), nie osobno dla
-- każdego mieszkania w budynku.
-- ============================================================

alter table listings
  add column if not exists social_post_synced_at timestamptz,
  add column if not exists parent_listing_id integer;
