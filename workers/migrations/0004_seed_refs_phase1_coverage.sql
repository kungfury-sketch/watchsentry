-- Phase 1 reference coverage expansion: ~155 -> ~290 references.
-- Apply: wrangler d1 execute watchsentry-db --remote --file=./migrations/0004_seed_refs_phase1_coverage.sql
--
-- Selection criteria (from Session 8 backlog + 2026-05-22 screenshot evidence):
--   1. **Screenshot misses observed on Chrono24 brand-index page**: 16800, 16610LV (Kermit),
--      116619LB (Smurf). These cards rendered with NO badge in user's screenshot — the
--      most direct evidence that the brand-index page hit rate (~3.3% per Session 8 audit)
--      is dominated by family-depth gaps, not parser bugs.
--   2. **Sub-variant + dial-code completeness** on the highest-listing-volume models
--      (Submariner, GMT-Master, Daytona, Datejust, Speedmaster Pro, Seamaster 300M, Black Bay 58).
--   3. **Vintage refs with strong eBay sold-comp density** — Daytona 6263/6265, Sub 5513,
--      GMT 1675, DJ 1601 — these still trade actively on Chrono24 and have enough sold-comps
--      on eBay to satisfy the 50-sample threshold.
--   4. **Brand-diversity bias** (Session 8 backlog) — adds depth to mid-tier brands
--      (Tudor, Cartier, Longines, Hamilton, Oris) so brand-index pages spanning multiple
--      brands have higher hit rates.
--
-- Hit-rate target after Phase 1 expansion: ≥40% on top-50 model pages (was ~10%),
-- ≥15% on brand-index pages (was ~3%).
--
-- Idempotent via INSERT OR IGNORE — re-running this is safe. Overlap with 0003 is fine.
--
-- Smoke after apply:
--   SELECT COUNT(*) FROM watch_references;                              -- expect ~290
--   SELECT COUNT(*) FROM watch_references WHERE brand='Rolex';          -- expect ~85
--   SELECT reference_number FROM watch_references
--     WHERE reference_number IN ('16800','16610LV','116619LB');         -- expect 3 rows

INSERT OR IGNORE INTO watch_references (brand, model, reference_number, display_name) VALUES
  -- ROLEX SUBMARINER — vintage + sub-variants (screenshot misses + family depth)
  ('Rolex', 'Submariner', '5512', 'Rolex Submariner 5512 (Vintage)'),
  ('Rolex', 'Submariner', '5513', 'Rolex Submariner 5513 (Vintage)'),
  ('Rolex', 'Submariner', '1680', 'Rolex Submariner Date 1680 (Vintage)'),
  ('Rolex', 'Submariner', '16800', 'Rolex Submariner Date 16800 (Transitional)'),
  ('Rolex', 'Submariner', '168000', 'Rolex Submariner Date 168000 (Triple-Zero)'),
  ('Rolex', 'Submariner', '14060', 'Rolex Submariner No-Date 14060'),
  ('Rolex', 'Submariner', '16613', 'Rolex Submariner Date 16613 (Two-Tone)'),
  ('Rolex', 'Submariner', '16618', 'Rolex Submariner Date 16618 (Yellow Gold)'),
  ('Rolex', 'Submariner', '16610LV', 'Rolex Submariner Date 16610LV (Kermit)'),
  ('Rolex', 'Submariner', '16619', 'Rolex Submariner Date 16619 (White Gold)'),
  ('Rolex', 'Submariner', '116619LB', 'Rolex Submariner Date 116619LB (Smurf)'),
  ('Rolex', 'Submariner', '116613LN', 'Rolex Submariner Date 116613LN (Bluesy)'),
  ('Rolex', 'Submariner', '126613LN', 'Rolex Submariner Date 126613LN (Bluesy, new)'),
  ('Rolex', 'Submariner', '126613LB', 'Rolex Submariner Date 126613LB (Bluesy Blue)'),
  ('Rolex', 'Submariner', '126618LN', 'Rolex Submariner Date 126618LN (Yellow Gold new)'),
  ('Rolex', 'Submariner', '126619LB', 'Rolex Submariner Date 126619LB (White Gold new)'),

  -- ROLEX GMT-MASTER — vintage + modern Pepsi / Batman / Sprite / Root Beer
  ('Rolex', 'GMT-Master', '1675', 'Rolex GMT-Master 1675 (Vintage)'),
  ('Rolex', 'GMT-Master', '16750', 'Rolex GMT-Master 16750'),
  ('Rolex', 'GMT-Master', '16700', 'Rolex GMT-Master 16700'),
  ('Rolex', 'GMT-Master II', '16713', 'Rolex GMT-Master II 16713 (Two-Tone)'),
  ('Rolex', 'GMT-Master II', '16718', 'Rolex GMT-Master II 16718 (Yellow Gold)'),
  ('Rolex', 'GMT-Master II', '116710BLNR', 'Rolex GMT-Master II 116710BLNR (Batman)'),
  ('Rolex', 'GMT-Master II', '116719BLRO', 'Rolex GMT-Master II 116719BLRO (White Gold Pepsi)'),
  ('Rolex', 'GMT-Master II', '126710BLRO', 'Rolex GMT-Master II 126710BLRO (Pepsi)'),
  ('Rolex', 'GMT-Master II', '126710BLNR', 'Rolex GMT-Master II 126710BLNR (Batman, new)'),
  ('Rolex', 'GMT-Master II', '126711CHNR', 'Rolex GMT-Master II 126711CHNR (Root Beer)'),
  ('Rolex', 'GMT-Master II', '126715CHNR', 'Rolex GMT-Master II 126715CHNR (Everose Root Beer)'),
  ('Rolex', 'GMT-Master II', '126720VTNR', 'Rolex GMT-Master II 126720VTNR (Sprite, left-hand)'),
  ('Rolex', 'GMT-Master II', '116758SA', 'Rolex GMT-Master II 116758SA (Yellow Gold gem-set)'),

  -- ROLEX DAYTONA — vintage Paul Newman through modern ceramic
  ('Rolex', 'Daytona', '6263', 'Rolex Cosmograph Daytona 6263 (Vintage)'),
  ('Rolex', 'Daytona', '6265', 'Rolex Cosmograph Daytona 6265 (Vintage)'),
  ('Rolex', 'Daytona', '16523', 'Rolex Daytona 16523 (Two-Tone Zenith)'),
  ('Rolex', 'Daytona', '16528', 'Rolex Daytona 16528 (Yellow Gold Zenith)'),
  ('Rolex', 'Daytona', '16518', 'Rolex Daytona 16518 (Yellow Gold leather)'),
  ('Rolex', 'Daytona', '116500LN', 'Rolex Cosmograph Daytona 116500LN (Steel Ceramic)'),
  ('Rolex', 'Daytona', '116520', 'Rolex Cosmograph Daytona 116520 (Steel)'),
  ('Rolex', 'Daytona', '116505', 'Rolex Cosmograph Daytona 116505 (Everose)'),
  ('Rolex', 'Daytona', '116515LN', 'Rolex Cosmograph Daytona 116515LN (Everose Ceramic)'),
  ('Rolex', 'Daytona', '116528', 'Rolex Cosmograph Daytona 116528 (Yellow Gold)'),
  ('Rolex', 'Daytona', '116523', 'Rolex Cosmograph Daytona 116523 (Two-Tone)'),
  ('Rolex', 'Daytona', '126500LN', 'Rolex Cosmograph Daytona 126500LN (2023 release)'),
  ('Rolex', 'Daytona', '126515LN', 'Rolex Cosmograph Daytona 126515LN (Everose, 2023)'),
  ('Rolex', 'Daytona', '126518LN', 'Rolex Cosmograph Daytona 126518LN (Yellow Gold, 2023)'),
  ('Rolex', 'Daytona', '126506', 'Rolex Cosmograph Daytona 126506 (Platinum, 2023)'),

  -- ROLEX DATEJUST — vintage + modern depth
  ('Rolex', 'Datejust', '1601', 'Rolex Datejust 1601 (Vintage)'),
  ('Rolex', 'Datejust', '1603', 'Rolex Datejust 1603 (Vintage)'),
  ('Rolex', 'Datejust', '16013', 'Rolex Datejust 16013 (Two-Tone)'),
  ('Rolex', 'Datejust', '16014', 'Rolex Datejust 16014 (Steel)'),
  ('Rolex', 'Datejust', '16030', 'Rolex Datejust 16030 (Steel)'),
  ('Rolex', 'Datejust', '116200', 'Rolex Datejust 36 116200 (Steel)'),
  ('Rolex', 'Datejust', '116201', 'Rolex Datejust 36 116201 (Two-Tone Everose)'),
  ('Rolex', 'Datejust', '116203', 'Rolex Datejust 36 116203 (Two-Tone YG)'),
  ('Rolex', 'Datejust', '116231', 'Rolex Datejust 36 116231 (Two-Tone Everose Jubilee)'),
  ('Rolex', 'Datejust', '126200', 'Rolex Datejust 36 126200 (Steel)'),
  ('Rolex', 'Datejust', '126233', 'Rolex Datejust 36 126233 (Two-Tone)'),
  ('Rolex', 'Datejust', '126234', 'Rolex Datejust 36 126234 (Steel)'),
  ('Rolex', 'Datejust', '126301', 'Rolex Datejust 41 126301 (Two-Tone Everose)'),
  ('Rolex', 'Datejust', '126331', 'Rolex Datejust 41 126331 (Two-Tone Everose Jubilee)'),
  ('Rolex', 'Datejust', '126334', 'Rolex Datejust 41 126334 (Steel Jubilee)'),
  ('Rolex', 'Datejust', '178241', 'Rolex Datejust 31 178241 (Two-Tone Everose)'),
  ('Rolex', 'Datejust', '278274', 'Rolex Datejust 31 278274 (Steel)'),

  -- ROLEX DAY-DATE — depth
  ('Rolex', 'Day-Date', '1803', 'Rolex Day-Date 1803 (Vintage)'),
  ('Rolex', 'Day-Date', '18038', 'Rolex Day-Date 18038 (Yellow Gold)'),
  ('Rolex', 'Day-Date', '18078', 'Rolex Day-Date 18078 (Yellow Gold Bark)'),
  ('Rolex', 'Day-Date', '118208', 'Rolex Day-Date 36 118208 (Yellow Gold)'),
  ('Rolex', 'Day-Date', '128235', 'Rolex Day-Date 36 128235 (Everose)'),
  ('Rolex', 'Day-Date', '228235', 'Rolex Day-Date 40 228235 (Everose)'),
  ('Rolex', 'Day-Date', '228239', 'Rolex Day-Date 40 228239 (White Gold)'),
  ('Rolex', 'Day-Date', '228398TBR', 'Rolex Day-Date 40 228398TBR (Yellow Gold diamond bezel)'),

  -- ROLEX SEA-DWELLER, EXPLORER, AIR-KING
  ('Rolex', 'Sea-Dweller', '16600', 'Rolex Sea-Dweller 16600'),
  ('Rolex', 'Sea-Dweller', '116660', 'Rolex Deepsea 116660'),
  ('Rolex', 'Sea-Dweller', '126660', 'Rolex Deepsea 126660 (D-Blue)'),
  ('Rolex', 'Sea-Dweller', '136660', 'Rolex Deepsea 136660 (Titanium, 2024)'),
  ('Rolex', 'Sea-Dweller', '126600', 'Rolex Sea-Dweller 126600 (Single Red 50th)'),
  ('Rolex', 'Sea-Dweller', '126603', 'Rolex Sea-Dweller 126603 (Two-Tone)'),
  ('Rolex', 'Explorer', '1016', 'Rolex Explorer 1016 (Vintage)'),
  ('Rolex', 'Explorer', '14270', 'Rolex Explorer 36 14270'),
  ('Rolex', 'Explorer', '114270', 'Rolex Explorer 36 114270'),
  ('Rolex', 'Explorer', '124270', 'Rolex Explorer 36 124270 (2021)'),
  ('Rolex', 'Explorer', '124273', 'Rolex Explorer 36 124273 (Two-Tone)'),
  ('Rolex', 'Explorer II', '16570', 'Rolex Explorer II 16570'),
  ('Rolex', 'Explorer II', '216570', 'Rolex Explorer II 42 216570'),
  ('Rolex', 'Explorer II', '226570', 'Rolex Explorer II 42 226570 (2021)'),
  ('Rolex', 'Air-King', '116900', 'Rolex Air-King 116900'),
  ('Rolex', 'Air-King', '126900', 'Rolex Air-King 126900 (2022)'),

  -- ROLEX YACHT-MASTER, SKY-DWELLER — modern
  ('Rolex', 'Yacht-Master', '116655', 'Rolex Yacht-Master 40 116655 (Everose Oysterflex)'),
  ('Rolex', 'Yacht-Master', '126622', 'Rolex Yacht-Master 40 126622 (Rhodium Platinum bezel)'),
  ('Rolex', 'Yacht-Master', '226658', 'Rolex Yacht-Master 42 226658 (Yellow Gold)'),
  ('Rolex', 'Yacht-Master', '226627', 'Rolex Yacht-Master 42 226627 (Titanium, 2023)'),
  ('Rolex', 'Sky-Dweller', '326934', 'Rolex Sky-Dweller 326934 (Steel/White Gold)'),
  ('Rolex', 'Sky-Dweller', '326135', 'Rolex Sky-Dweller 326135 (Everose, leather)'),

  -- OMEGA SPEEDMASTER PROFESSIONAL — full family (Session 8 backlog explicit)
  ('Omega', 'Speedmaster', '3570.50.00', 'Omega Speedmaster Professional Moonwatch 3570.50.00'),
  ('Omega', 'Speedmaster', '3573.50.00', 'Omega Speedmaster Professional Sapphire-Sandwich 3573.50.00'),
  ('Omega', 'Speedmaster', '311.30.42.30.01.005', 'Omega Speedmaster Professional Moonwatch 311.30.42.30.01.005'),
  ('Omega', 'Speedmaster', '310.30.42.50.01.002', 'Omega Speedmaster Professional Moonwatch 310.30.42.50.01.002'),
  ('Omega', 'Speedmaster', '310.32.42.50.01.001', 'Omega Speedmaster Professional Moonwatch 310.32.42.50.01.001'),
  ('Omega', 'Speedmaster', '310.32.42.50.04.001', 'Omega Speedmaster Professional Moonwatch 310.32.42.50.04.001 (Silver dial)'),
  ('Omega', 'Speedmaster', '311.30.42.30.01.006', 'Omega Speedmaster Apollo 11 50th Anniversary 311.30.42.30.01.006'),
  ('Omega', 'Speedmaster', '311.62.42.30.06.001', 'Omega Speedmaster Dark Side of the Moon 311.62.42.30.06.001'),
  ('Omega', 'Speedmaster', '329.30.43.51.01.001', 'Omega Speedmaster Racing Master Chronometer 329.30.43.51.01.001'),

  -- OMEGA SEAMASTER 300M — full family (most-listed Omega on Chrono24)
  ('Omega', 'Seamaster Diver 300M', '210.30.42.20.01.001', 'Omega Seamaster Diver 300M 210.30.42.20.01.001'),
  ('Omega', 'Seamaster Diver 300M', '210.30.42.20.03.001', 'Omega Seamaster Diver 300M 210.30.42.20.03.001 (Blue dial)'),
  ('Omega', 'Seamaster Diver 300M', '210.32.42.20.01.001', 'Omega Seamaster Diver 300M 210.32.42.20.01.001 (Rubber)'),
  ('Omega', 'Seamaster Diver 300M', '210.30.42.20.06.001', 'Omega Seamaster Diver 300M 210.30.42.20.06.001 (PVD Blue)'),
  ('Omega', 'Seamaster Diver 300M', '210.30.42.20.10.001', 'Omega Seamaster Diver 300M 210.30.42.20.10.001 (Bond 60th)'),
  ('Omega', 'Seamaster Diver 300M', '212.30.41.20.01.003', 'Omega Seamaster Diver 300M 212.30.41.20.01.003 (Pre-2018)'),
  ('Omega', 'Seamaster Aqua Terra', '220.10.41.21.01.001', 'Omega Aqua Terra 150M 41 220.10.41.21.01.001'),
  ('Omega', 'Seamaster Aqua Terra', '220.10.41.21.03.001', 'Omega Aqua Terra 150M 41 220.10.41.21.03.001 (Blue)'),
  ('Omega', 'Seamaster Aqua Terra', '220.10.38.20.02.001', 'Omega Aqua Terra 150M 38 220.10.38.20.02.001'),

  -- TUDOR BLACK BAY — full family (Session 8 backlog explicit)
  ('Tudor', 'Black Bay 58', '79030N', 'Tudor Black Bay 58 79030N (Black)'),
  ('Tudor', 'Black Bay 58', '79030B', 'Tudor Black Bay 58 79030B (Navy Blue)'),
  ('Tudor', 'Black Bay 58', '79010SG', 'Tudor Black Bay 58 79010SG (Silver-Gilt)'),
  ('Tudor', 'Black Bay 58', '79018V', 'Tudor Black Bay 58 79018V (Bronze)'),
  ('Tudor', 'Black Bay 58', '79060', 'Tudor Black Bay 58 GMT 79060 (rumored slot)'),
  ('Tudor', 'Black Bay', '79230N', 'Tudor Black Bay 41 79230N (Black bezel)'),
  ('Tudor', 'Black Bay', '79230DK', 'Tudor Black Bay 41 79230DK (Dark)'),
  ('Tudor', 'Black Bay', '79730', 'Tudor Black Bay Chronograph 79730'),
  ('Tudor', 'Black Bay GMT', '79830RB', 'Tudor Black Bay GMT 79830RB (Pepsi)'),
  ('Tudor', 'Black Bay Pro', '79470', 'Tudor Black Bay Pro 79470 (Yellow GMT)'),
  ('Tudor', 'Pelagos', '25600TN', 'Tudor Pelagos 25600TN (Black)'),
  ('Tudor', 'Pelagos', '25610TNL', 'Tudor Pelagos LHD 25610TNL'),
  ('Tudor', 'Pelagos', '25407N', 'Tudor Pelagos FXD 25407N'),
  ('Tudor', 'Pelagos', '25807KN', 'Tudor Pelagos 39 25807KN'),

  -- CARTIER SANTOS & TANK — modern depth
  ('Cartier', 'Santos', 'WSSA0009', 'Cartier Santos Large WSSA0009'),
  ('Cartier', 'Santos', 'WSSA0018', 'Cartier Santos Medium Two-Tone WSSA0018'),
  ('Cartier', 'Santos', 'WSSA0030', 'Cartier Santos Large Two-Tone WSSA0030'),
  ('Cartier', 'Santos', 'WGSA0007', 'Cartier Santos Medium Yellow Gold WGSA0007'),
  ('Cartier', 'Santos Galbée', 'W20064D6', 'Cartier Santos Galbée XL W20064D6'),
  ('Cartier', 'Tank Must', 'WSTA0041', 'Cartier Tank Must Large WSTA0041'),
  ('Cartier', 'Tank Must', 'WSTA0040', 'Cartier Tank Must Large WSTA0040'),
  ('Cartier', 'Tank Française', 'W51008Q3', 'Cartier Tank Française Medium W51008Q3'),
  ('Cartier', 'Tank Américaine', 'W2620030', 'Cartier Tank Américaine W2620030'),
  ('Cartier', 'Ballon Bleu', 'W69010Z4', 'Cartier Ballon Bleu 42 W69010Z4'),
  ('Cartier', 'Ballon Bleu', 'WSBB0040', 'Cartier Ballon Bleu 36 WSBB0040'),

  -- PATEK PHILIPPE — Nautilus + Aquanaut family
  ('Patek Philippe', 'Nautilus', '5711/1A-010', 'Patek Philippe Nautilus 5711/1A-010 (Blue dial)'),
  ('Patek Philippe', 'Nautilus', '5711/1A-014', 'Patek Philippe Nautilus 5711/1A-014 (Olive Green dial)'),
  ('Patek Philippe', 'Nautilus', '5711/1R-001', 'Patek Philippe Nautilus 5711/1R-001 (Rose Gold)'),
  ('Patek Philippe', 'Nautilus', '5711/1P-001', 'Patek Philippe Nautilus 5711/1P-001 (Platinum, Tiffany)'),
  ('Patek Philippe', 'Nautilus', '5990/1A-001', 'Patek Philippe Nautilus 5990/1A-001 (Travel Time Chronograph)'),
  ('Patek Philippe', 'Aquanaut', '5167A-001', 'Patek Philippe Aquanaut 5167A-001'),
  ('Patek Philippe', 'Aquanaut', '5167R-001', 'Patek Philippe Aquanaut 5167R-001 (Rose Gold)'),
  ('Patek Philippe', 'Aquanaut', '5164A-001', 'Patek Philippe Aquanaut Travel Time 5164A-001'),
  ('Patek Philippe', 'Calatrava', '5227G-001', 'Patek Philippe Calatrava 5227G-001'),
  ('Patek Philippe', 'Calatrava', '5196P-001', 'Patek Philippe Calatrava 5196P-001 (Platinum)'),
  ('Patek Philippe', 'Calatrava', '5524G-001', 'Patek Philippe Calatrava Pilot Travel Time 5524G-001'),

  -- AUDEMARS PIGUET — Royal Oak depth
  ('Audemars Piguet', 'Royal Oak', '15500ST.OO.1220ST.01', 'AP Royal Oak Selfwinding 41 15500ST.OO.1220ST.01'),
  ('Audemars Piguet', 'Royal Oak', '15510ST.OO.1320ST.01', 'AP Royal Oak Jumbo Extra-Thin 39 15510ST.OO.1320ST.01'),
  ('Audemars Piguet', 'Royal Oak', '15202ST.OO.1240ST.01', 'AP Royal Oak Jumbo Extra-Thin 39 15202ST.OO.1240ST.01'),
  ('Audemars Piguet', 'Royal Oak', '26240ST.OO.1320ST.05', 'AP Royal Oak 50th Anniversary 41 26240ST.OO.1320ST.05'),
  ('Audemars Piguet', 'Royal Oak Offshore', '26420SO.OO.A002CA.01', 'AP Royal Oak Offshore Chronograph 43 26420SO'),
  ('Audemars Piguet', 'Royal Oak Offshore', '26238ST.OO.2000ST.01', 'AP Royal Oak Offshore 50th Anniversary 26238ST'),

  -- IWC — Pilot & Portugieser depth
  ('IWC', 'Pilot', 'IW377709', 'IWC Pilot''s Watch Chronograph 41 IW377709'),
  ('IWC', 'Pilot Spitfire', 'IW387901', 'IWC Pilot''s Spitfire Chronograph IW387901'),
  ('IWC', 'Pilot Top Gun', 'IW389001', 'IWC Pilot''s Watch Top Gun Chronograph IW389001'),
  ('IWC', 'Big Pilot', 'IW501012', 'IWC Big Pilot''s Watch Perpetual Calendar IW501012'),
  ('IWC', 'Pilot Mark', 'IW328201', 'IWC Pilot''s Watch Mark XX 40 IW328201'),
  ('IWC', 'Portugieser', 'IW358304', 'IWC Portugieser Chronograph IW358304'),
  ('IWC', 'Portugieser', 'IW371609', 'IWC Portugieser Chronograph 41 IW371609 (Steel/Blue)'),
  ('IWC', 'Portugieser', 'IW503312', 'IWC Portugieser Perpetual Calendar 44 IW503312'),

  -- BREITLING — Navitimer + Superocean depth
  ('Breitling', 'Navitimer', 'AB0121211B1A1', 'Breitling Navitimer B01 Chronograph 46 AB0121211B1A1'),
  ('Breitling', 'Navitimer', 'AB0127211B1A1', 'Breitling Navitimer B01 Chronograph 43 AB0127211B1A1'),
  ('Breitling', 'Navitimer', 'AB0138241B1P1', 'Breitling Navitimer B01 Chronograph 41 AB0138241B1P1'),
  ('Breitling', 'Navitimer', 'A23322', 'Breitling Navitimer A23322 (Vintage automatic)'),
  ('Breitling', 'Superocean', 'A17376211B1S1', 'Breitling Superocean Automatic 42 A17376211B1S1'),
  ('Breitling', 'Superocean', 'A17367D81B1S1', 'Breitling Superocean Automatic 44 A17367D81B1S1'),
  ('Breitling', 'Avenger', 'A13317101C1A1', 'Breitling Avenger Chronograph 45 A13317101C1A1'),
  ('Breitling', 'Top Time', 'A23310241C1X1', 'Breitling Top Time B01 Triumph A23310241C1X1'),

  -- GRAND SEIKO — broader catalog
  ('Grand Seiko', 'Heritage', 'SBGA413', 'Grand Seiko Heritage SBGA413 (Shunbun)'),
  ('Grand Seiko', 'Heritage', 'SLGH005', 'Grand Seiko Heritage SLGH005 (White Birch)'),
  ('Grand Seiko', 'Heritage', 'SLGA009', 'Grand Seiko Heritage SLGA009'),
  ('Grand Seiko', 'Heritage', 'SBGJ201', 'Grand Seiko Heritage SBGJ201 (GMT Hi-Beat)'),
  ('Grand Seiko', 'Evolution 9', 'SLGH017', 'Grand Seiko Evolution 9 SLGH017'),
  ('Grand Seiko', 'Sport', 'SBGE253', 'Grand Seiko Sport SBGE253 (Spring Drive GMT)'),
  ('Grand Seiko', 'Elegance', 'SBGM221', 'Grand Seiko Elegance SBGM221'),

  -- LONGINES — broader depth
  ('Longines', 'Heritage Military', 'L28194930', 'Longines Heritage Military 1938 L28194930'),
  ('Longines', 'Master', 'L26734786', 'Longines Master Collection 42 L26734786'),
  ('Longines', 'Conquest', 'L37304966', 'Longines Conquest L37304966'),
  ('Longines', 'Spirit Zulu Time', 'L38124939', 'Longines Spirit Zulu Time 42 L38124939'),

  -- HAMILTON — broader depth
  ('Hamilton', 'Khaki Field', 'H70535040', 'Hamilton Khaki Field Auto H70535040'),
  ('Hamilton', 'Jazzmaster', 'H32505131', 'Hamilton Jazzmaster Open Heart Auto H32505131'),
  ('Hamilton', 'Intra-Matic', 'H38416711', 'Hamilton Intra-Matic Auto H38416711'),
  ('Hamilton', 'Ventura', 'H24411732', 'Hamilton Ventura Quartz H24411732'),
  ('Hamilton', 'Pan Europ', 'H35415541', 'Hamilton Pan Europ Auto H35415541'),

  -- ORIS — broader depth
  ('Oris', 'Aquis', '0173377354185', 'Oris Aquis Date 41.5 0173377354185'),
  ('Oris', 'Aquis', '0174377764157', 'Oris Aquis Date Caliber 400 0174377764157'),
  ('Oris', 'ProPilot', '0175177544054', 'Oris ProPilot X 0175177544054'),
  ('Oris', 'Big Crown', '0175477734061', 'Oris Big Crown Pointer Date 38 0175477734061'),

  -- PANERAI — broader depth
  ('Panerai', 'Luminor Marina', 'PAM01312', 'Panerai Luminor Marina 44 PAM01312'),
  ('Panerai', 'Luminor', 'PAM01359', 'Panerai Luminor Quaranta 40 PAM01359'),
  ('Panerai', 'Submersible', 'PAM00973', 'Panerai Submersible 42 PAM00973'),
  ('Panerai', 'Submersible', 'PAM01683', 'Panerai Submersible QuarantaQuattro PAM01683'),

  -- BLANCPAIN, ZENITH (new brand entries — gaps in current catalog)
  ('Blancpain', 'Fifty Fathoms', '5015-1130-52A', 'Blancpain Fifty Fathoms 5015-1130-52A'),
  ('Blancpain', 'Fifty Fathoms', '5015B-1130-52A', 'Blancpain Fifty Fathoms 5015B-1130-52A (Bathyscaphe)'),
  ('Blancpain', 'Villeret', '6651-1127-55B', 'Blancpain Villeret Date 6651-1127-55B'),
  ('Zenith', 'Chronomaster', '03.3100.3600/69.M3100', 'Zenith Chronomaster Sport El Primero'),
  ('Zenith', 'Defy', '95.9000.9004/78.R582', 'Zenith Defy Skyline Skeleton 41'),
  ('Zenith', 'El Primero', '03.2150.400/53.M2150', 'Zenith El Primero A384 Revival');
