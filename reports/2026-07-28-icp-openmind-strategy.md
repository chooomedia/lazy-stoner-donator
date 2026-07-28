# ICP-, Awareness- und OpenMind-Strategie (2026-07-28)

Kontext: Nutzerauftrag vom 28.07.2026 – Blog-Card-Labels konsistent machen,
CTA-Wordings ICP-fit (weniger gönnerhaft, nicht Chris-zentriert),
Awareness-Potenzial recherchieren, 3 OpenMind/SuppleMinds-Produkte aufnehmen
und ein Vorgehen für freiwillige Promo ggü. Simon Ruane vorbereiten.

## Verifizierte Fakten (Methoden + Quellen)

- **OpenMind-Produktdaten** via WooCommerce Store API
  (`https://openmind.market/wp-json/wc/store/v1/products`, abgerufen 2026-07-28):
  - Happy Caps Brain – 9,90 EUR, `is_in_stock: true`, Produktbild 58057_Product.jpg
  - Happy Caps Energy – 9,90 EUR, `is_in_stock: true`, Produktbild 58087_Product.jpg
  - Happy Caps Relax – 9,90 EUR, `is_in_stock: true`, Produktbild 58077_Product.jpg
  - Beschreibungen des Shops: „ethnobotanische Kapseln aus den Niederlanden",
    Rhodiola/L-Theanin/GABA (Brain), Rhodiola/Guarana/Guayusa (Energy),
    GABA/L-Theanin/Magnesium (Relax).
- **„SuppleMinds Limitless" existiert nicht als Produkt.** Store-API-Suche nach
  „limitless" liefert `[]`; „SuppleMinds" ist die Kategorie
  (`/produkt-kategorie/suppleminds/`). Kein Produkt dieses Namens im Sortiment
  (Stand 2026-07-28).
- **Kein Affiliate-/Partnerprogramm auffindbar**: weder Footer-Links noch
  Seiten-Suche noch Store-API liefern Affiliate-/Partner-/Empfehlungs-Endpunkte
  auf openmind.market (Stand 2026-07-28).
- **Simon Ruane** ist auf openmind.market als Person hinter dem Projekt
  dokumentiert (`/simon-ruane-open-mind-aufklaerung-medien/`), Facebook-Profil
  öffentlich; Twitch-Aktivität laut Nutzer.
- **ICP-Communities (öffentlich bekannte, qualitative Angaben ohne Metriken)**:
  r/germantrees (Reddit, deutschsprachige Cannabis-Community), grower.ch
  (ältestes deutsches Grow-Forum), DHV (Deutscher Hanfverband, bereits als
  Spendenkarte vertreten), deutsche Cannabis-Twitch-Szene (Schnittmenge
  Simon Ruane / Cannachris).

## Umgesetzte Änderungen

1. **Blog-Card-Labels** an die Bestandskonventionen angeglichen:
   `audienceLabel` im „Für …"-Benefit-Pattern, `ctaLabel` als kurzes
   Aktionsverb pro Karte (z. B. „Für eigene Faktenchecks" / „Quellen prüfen").
2. **CTA-Varianten** (Experiment-Variable: Wording, eine Variable):
   `Für Chris checken`/`Zum Wunsch`/`Setup-Upgrade ansehen` ersetzt durch
   `Zeig mir mehr`/`Das check ich`/`Setup-Details ansehen` (DE) bzw.
   `Show me more`/`I'll check this`/`View setup details` (EN). Rationale:
   Autonomie- und Neugier-Framing statt Gönner-Framing; ICP spricht Twitch-/
   Reddit-Kauderwelsch („checken"), keine Charity-Sprache.
3. **3 OpenMind-Cards** (host `openmind`, Pos. 11/46/81) mit verifiziertem
   Preis (9,90 EUR, provenance `verified_from_source_shop`) und direkten
   Shop-Links ohne Affiliate-Tag. EN-Texte mit „German shop"-Hinweis.

## Hypothesen (explizit als solche markiert, nicht als Fakten)

- H1: ICP-fit CTA-Wordings erhöhen die Klickrate auf Produktkarten gegenüber
  Gönner-Framing. Messbar erst mit Tracking – aktuell nicht vorhanden.
- H2: Die OpenMind-Cards erzeugen Gesprächsanlass Richtung Simon Ruane
  (Cross-Audience), weil sie sichtbar, verlinkt und als freiwilliger Support
  erkennbar sind.
- H3: Größter Awareness-Hebel kurzfristig ist nicht die Wishlist selbst,
  sondern die ÄKN-Kampagnen-Inhalte (Blog-Cards + Kampagnen-Karten), weil sie
  Nachrichtenwert haben und in Community-Kontexten (r/germantrees, DHV-Nähe)
  als Mehrwert statt Eigenpromo durchgehen können.

## Was dem ICP fehlt / Lücken (Beobachtung, keine Maßnahme)

- Keine Share-Assets pro Kampagne (nur Karten-Share mit generischem OG-Bild;
  pro-Karten-OG erfordert Prerendering – aktuell statisch nicht möglich).
- Kein Tracking/Analytics auf der Wishlist → Conversion-Hypothesen sind ohne
  Datenlage nicht verifizierbar (bewusste Datenschutz-Entscheidung, bleibt so).
- r/germantrees & Co. werten Eigenpromo hart ab; dort funktionieren nur
  Inhalte mit eigenständigem Nutzen (Quellenartikel, Faktencheck-Anleitungen).

## Vorgehen Simon Ruane / OpenMind (Schritt-für-Schritt)

1. ✅ Cards live stellen (drei SuppleMinds-Produkte, Direktlinks, kein Affiliate).
2. Belege sichern: Live-URLs der drei Karten + Screenshot des Grids.
3. Beim nächsten Twitch-Livestream Simons im Chat kurz und nicht aufdringlich
   erwähnen: „Hab drei SuppleMinds-Produkte auf meiner Wishlist verlinkt
   (freiwillig, ohne Deal) – lsd.cannachris.de, Positionen 11/46/81."
4. Falls Reaktion positiv: fragen, ob es einen Affiliate-/Referral-Weg gibt
   oder ob ein kurzer Austausch (DM/Discord) gewünscht ist. Keine Annahmen
   über Konditionen – es gibt aktuell kein nachweisbares Programm.
5. Erst nach expliziter Absprache `partner`-Felder/Referral-Parameter in
   `wishlist-products.json` setzen und im Report dokumentieren. Regel:
   kein Tag ohne Verifizierung.

## Nächste sinnvolle Schritte (Backlog, priorisiert)

1. Simon-Kontakt beim nächsten Stream (Punkt 3 oben).
2. Beobachten: Klickverhalten auf neue CTAs, falls je Tracking kommt.
3. Bei neuen Blogartikeln auf cannachris.de: Rotation der Blog-Cards prüfen
   (gleiches Verifikationsverfahren via WP REST API).
