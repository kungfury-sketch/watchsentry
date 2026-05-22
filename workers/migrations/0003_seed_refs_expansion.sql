-- Phase 0 reference coverage expansion: 50 -> ~150 references.
-- Apply: wrangler d1 execute watchsentry-db --remote --file=./migrations/0003_seed_refs_expansion.sql
--
-- Selection criteria:
--   1. Real, currently or recently in-production references with active Chrono24 listings.
--   2. Higher-confidence: well-documented in brand catalogs and eBay sold-listings.
--   3. Skews toward the major brands' deeper catalog (Rolex, Omega, Tudor) plus entry-tier
--      brands users frequently cross-shop on Chrono24 (Tag Heuer, Hamilton, Longines, Seiko).
--   4. Avoids ultra-vintage refs without strong eBay comp density.
--
-- Idempotent via INSERT OR IGNORE — re-running this is safe.

INSERT OR IGNORE INTO watch_references (brand, model, reference_number, display_name) VALUES
  -- Rolex — depth on existing model lines
  ('Rolex', 'Submariner', '116610LN', 'Rolex Submariner Date 116610LN'),
  ('Rolex', 'Submariner', '116610LV', 'Rolex Submariner Date 116610LV (Hulk)'),
  ('Rolex', 'Submariner', '116618LN', 'Rolex Submariner Date 116618LN (Yellow Gold)'),
  ('Rolex', 'Submariner', '14060M', 'Rolex Submariner 14060M'),
  ('Rolex', 'Submariner', '16610', 'Rolex Submariner 16610'),
  ('Rolex', 'GMT-Master II', '116710LN', 'Rolex GMT-Master II 116710LN'),
  ('Rolex', 'GMT-Master II', '16710', 'Rolex GMT-Master II 16710'),
  ('Rolex', 'Daytona', '116508', 'Rolex Daytona 116508 (Yellow Gold)'),
  ('Rolex', 'Daytona', '116519LN', 'Rolex Daytona 116519LN (White Gold)'),
  ('Rolex', 'Daytona', '16520', 'Rolex Daytona Zenith 16520'),
  ('Rolex', 'Datejust', '116200', 'Rolex Datejust 36 116200'),
  ('Rolex', 'Datejust', '116234', 'Rolex Datejust 36 116234'),
  ('Rolex', 'Datejust', '16234', 'Rolex Datejust 36 16234'),
  ('Rolex', 'Datejust', '178240', 'Rolex Datejust 31 178240'),
  ('Rolex', 'Datejust', '126300', 'Rolex Datejust 41 126300'),
  ('Rolex', 'Day-Date', '118238', 'Rolex Day-Date 36 118238'),
  ('Rolex', 'Day-Date', '128238', 'Rolex Day-Date 36 128238'),
  ('Rolex', 'Sky-Dweller', '326933', 'Rolex Sky-Dweller 326933'),
  ('Rolex', 'Sky-Dweller', '336934', 'Rolex Sky-Dweller 336934'),
  ('Rolex', 'Yacht-Master', '116622', 'Rolex Yacht-Master 40 116622'),
  ('Rolex', 'Yacht-Master', '226659', 'Rolex Yacht-Master 42 226659'),
  ('Rolex', 'Milgauss', '116400GV', 'Rolex Milgauss 116400GV (Green Sapphire)'),
  ('Rolex', 'Explorer', '214270', 'Rolex Explorer 39 214270'),

  -- Omega — depth on Speedmaster, Seamaster, plus Planet Ocean / Railmaster / De Ville
  ('Omega', 'Speedmaster', '311.33.42.30.01.001', 'Omega Speedmaster Professional 311.33.42.30.01.001'),
  ('Omega', 'Speedmaster', '329.30.43.51.02.001', 'Omega Speedmaster Racing 329.30.43.51.02.001'),
  ('Omega', 'Speedmaster', '326.30.40.50.01.001', 'Omega Speedmaster Reduced 326.30.40.50.01.001'),
  ('Omega', 'Seamaster Planet Ocean', '215.30.44.21.01.001', 'Omega Seamaster Planet Ocean 600M 215.30.44.21.01.001'),
  ('Omega', 'Seamaster Planet Ocean', '215.30.40.20.01.001', 'Omega Seamaster Planet Ocean 600M 39.5mm 215.30.40.20.01.001'),
  ('Omega', 'Seamaster Railmaster', '220.10.40.20.01.001', 'Omega Seamaster Railmaster 220.10.40.20.01.001'),
  ('Omega', 'Aqua Terra', '220.10.43.22.10.001', 'Omega Aqua Terra 220.10.43.22.10.001'),
  ('Omega', 'Aqua Terra', '231.10.42.21.03.001', 'Omega Aqua Terra 231.10.42.21.03.001'),
  ('Omega', 'De Ville', '424.10.40.20.02.001', 'Omega De Ville Prestige 424.10.40.20.02.001'),
  ('Omega', 'Constellation', '131.10.39.20.02.001', 'Omega Constellation Globemaster 131.10.39.20.02.001'),

  -- Tudor — depth on Black Bay, Pelagos, Royal
  ('Tudor', 'Black Bay', '79220R', 'Tudor Heritage Black Bay 79220R'),
  ('Tudor', 'Black Bay', '79230B', 'Tudor Black Bay 41 79230B'),
  ('Tudor', 'Black Bay 36', '79500', 'Tudor Black Bay 36 79500'),
  ('Tudor', 'Pelagos', '25600TB', 'Tudor Pelagos 25600TB (Blue)'),
  ('Tudor', 'Black Bay Pro', '79470', 'Tudor Black Bay Pro 79470'),
  ('Tudor', 'Royal', '28500', 'Tudor Royal 28500'),
  ('Tudor', 'Heritage Chrono', '70330N', 'Tudor Heritage Chrono 70330N'),
  ('Tudor', 'Glamour', 'M55000', 'Tudor Glamour Date M55000'),

  -- Cartier — wider line coverage
  ('Cartier', 'Tank', 'WSTA0028', 'Cartier Tank Solo XL WSTA0028'),
  ('Cartier', 'Tank Française', 'WGTA0030', 'Cartier Tank Française WGTA0030'),
  ('Cartier', 'Tank', 'W1529856', 'Cartier Tank Louis Cartier W1529856'),
  ('Cartier', 'Pasha', 'WGPA0014', 'Cartier Pasha de Cartier WGPA0014'),
  ('Cartier', 'Drive', 'WSNM0014', 'Cartier Drive de Cartier WSNM0014'),
  ('Cartier', 'Santos', 'WSSA0010', 'Cartier Santos Medium WSSA0010'),
  ('Cartier', 'Santos Dumont', 'WGSA0021', 'Cartier Santos Dumont WGSA0021'),

  -- Audemars Piguet — Royal Oak Offshore + Code 11.59
  ('Audemars Piguet', 'Royal Oak', '26331ST.OO.1220ST.01', 'AP Royal Oak Chronograph 41 26331ST'),
  ('Audemars Piguet', 'Royal Oak Offshore', '26470ST.OO.A027CA.01', 'AP Royal Oak Offshore 42 26470ST'),
  ('Audemars Piguet', 'Code 11.59', '26393BC.OO.A002CR.01', 'AP Code 11.59 Chronograph 26393BC'),
  ('Audemars Piguet', 'Royal Oak', '26574ST.OO.1220ST.02', 'AP Royal Oak Perpetual Calendar 26574ST'),
  ('Audemars Piguet', 'Royal Oak', '15400ST.OO.1220ST.01', 'AP Royal Oak Selfwinding 41 15400ST'),

  -- Patek Philippe — depth
  ('Patek Philippe', 'Nautilus', '5712/1A-001', 'Patek Philippe Nautilus 5712/1A-001'),
  ('Patek Philippe', 'Nautilus', '5980/1A-001', 'Patek Philippe Nautilus Chronograph 5980/1A-001'),
  ('Patek Philippe', 'Aquanaut', '5168G-001', 'Patek Philippe Aquanaut 5168G-001'),
  ('Patek Philippe', 'Calatrava', '6119G-001', 'Patek Philippe Calatrava 6119G-001'),
  ('Patek Philippe', 'Twenty~4', '7300/1200R', 'Patek Philippe Twenty~4 Automatic 7300/1200R'),

  -- IWC — depth on Pilot / Portugieser plus Portofino / Ingenieur
  ('IWC', 'Big Pilot', 'IW501001', 'IWC Big Pilot 46 IW501001'),
  ('IWC', 'Pilot Top Gun', 'IW389002', 'IWC Pilot Chronograph Top Gun IW389002'),
  ('IWC', 'Portugieser', 'IW500712', 'IWC Portugieser Automatic 42 IW500712'),
  ('IWC', 'Aquatimer', 'IW329001', 'IWC Aquatimer Automatic IW329001'),
  ('IWC', 'Portofino', 'IW356501', 'IWC Portofino Automatic IW356501'),
  ('IWC', 'Ingenieur', 'IW328901', 'IWC Ingenieur Automatic 40 IW328901'),

  -- Breitling — depth across Premier / Chronomat / Avenger / Superocean Heritage / Endurance
  ('Breitling', 'Premier', 'AB0118A11A1A1', 'Breitling Premier B01 Chronograph 42 AB0118A11A1A1'),
  ('Breitling', 'Chronomat', 'AB0134101C1A1', 'Breitling Chronomat B01 42 AB0134101C1A1'),
  ('Breitling', 'Avenger', 'A17318101B1A1', 'Breitling Avenger Automatic 43 A17318101B1A1'),
  ('Breitling', 'Superocean Heritage', 'AB2010121B1A1', 'Breitling Superocean Heritage B20 42 AB2010121B1A1'),
  ('Breitling', 'Endurance Pro', 'X82310101B1S1', 'Breitling Endurance Pro 44 X82310101B1S1'),

  -- Grand Seiko — Snowflake & Spring Drive depth
  ('Grand Seiko', 'Heritage', 'SBGA211', 'Grand Seiko Heritage SBGA211 (Snowflake)'),
  ('Grand Seiko', 'Heritage', 'SBGA231', 'Grand Seiko Heritage SBGA231'),
  ('Grand Seiko', 'Heritage', 'SBGH267', 'Grand Seiko Heritage SBGH267'),
  ('Grand Seiko', 'Sport', 'SBGA231G', 'Grand Seiko Sport SBGA231G'),
  ('Grand Seiko', 'Elegance', 'SBGW235', 'Grand Seiko Elegance SBGW235'),

  -- Panerai — broader Luminor / Submersible / Radiomir
  ('Panerai', 'Luminor', 'PAM00112', 'Panerai Luminor Marina PAM00112'),
  ('Panerai', 'Submersible', 'PAM00692', 'Panerai Submersible BMG-TECH PAM00692'),
  ('Panerai', 'Radiomir', 'PAM00992', 'Panerai Radiomir PAM00992'),
  ('Panerai', 'Luminor Due', 'PAM00926', 'Panerai Luminor Due 42 PAM00926'),

  -- Hublot — Big Bang / Classic Fusion / Spirit of Big Bang
  ('Hublot', 'Big Bang', '441.NX.1171.RX', 'Hublot Big Bang Unico 42 441.NX.1171.RX'),
  ('Hublot', 'Classic Fusion', '511.NX.1171.RX', 'Hublot Classic Fusion 45 511.NX.1171.RX'),
  ('Hublot', 'Spirit of Big Bang', '601.NX.0173.LR', 'Hublot Spirit of Big Bang 42 601.NX.0173.LR'),

  -- TAG Heuer — entry to mid-tier coverage
  ('TAG Heuer', 'Carrera', 'CBN2A1B.BA0643', 'TAG Heuer Carrera Chronograph CBN2A1B.BA0643'),
  ('TAG Heuer', 'Monaco', 'CAW2110.FC6177', 'TAG Heuer Monaco Calibre 11 CAW2110.FC6177'),
  ('TAG Heuer', 'Aquaracer', 'WBP201A.BA0632', 'TAG Heuer Aquaracer Professional 300 WBP201A.BA0632'),
  ('TAG Heuer', 'Formula 1', 'CAZ101AC.BA0842', 'TAG Heuer Formula 1 CAZ101AC.BA0842'),

  -- Hamilton — Khaki Field and Aviation lines
  ('Hamilton', 'Khaki Field', 'H70455533', 'Hamilton Khaki Field Mechanical H70455533'),
  ('Hamilton', 'Khaki Field', 'H70225553', 'Hamilton Khaki Field Auto H70225553'),
  ('Hamilton', 'Khaki Aviation', 'H64575735', 'Hamilton Khaki Aviation Pilot Pioneer H64575735'),
  ('Hamilton', 'Intra-Matic', 'H38755751', 'Hamilton Intra-Matic Auto Chrono H38755751'),

  -- Longines — HydroConquest, Master, Heritage
  ('Longines', 'HydroConquest', 'L37814566', 'Longines HydroConquest 41 L37814566'),
  ('Longines', 'Master', 'L26288732', 'Longines Master Collection L26288732'),
  ('Longines', 'Heritage Classic', 'L23304520', 'Longines Heritage Classic L23304520'),
  ('Longines', 'Spirit', 'L38104530', 'Longines Spirit 40 L38104530'),

  -- Seiko (non-GS) — popular Prospex / 5 Sports
  ('Seiko', 'Prospex', 'SPB143', 'Seiko Prospex 1965 Diver Reissue SPB143'),
  ('Seiko', 'Prospex', 'SPB185', 'Seiko Prospex Marinemaster Reissue SPB185'),
  ('Seiko', 'Prospex', 'SPB243', 'Seiko Prospex Captain Willard SPB243'),
  ('Seiko', '5 Sports', 'SRPD55', 'Seiko 5 Sports SRPD55'),
  ('Seiko', 'Presage', 'SARX055', 'Seiko Presage Cocktail Time SARX055'),

  -- Oris — Aquis and Big Crown
  ('Oris', 'Aquis', '0173377304135', 'Oris Aquis Date 43.5 0173377304135'),
  ('Oris', 'Big Crown', '0175477414364', 'Oris Big Crown Pointer Date 0175477414364'),
  ('Oris', 'Divers Sixty-Five', '0173377074053', 'Oris Divers Sixty-Five 40 0173377074053'),

  -- Bell & Ross — flagship square pilot watches
  ('Bell & Ross', 'BR 03', 'BR0392-BL-CE', 'Bell & Ross BR 03-92 Blue Ceramic BR0392-BL-CE'),
  ('Bell & Ross', 'BR 03', 'BR0394-BL-CE', 'Bell & Ross BR 03-94 Blue Ceramic BR0394-BL-CE'),

  -- Vacheron Constantin — depth past Overseas
  ('Vacheron Constantin', 'Overseas', '4500V/110A-B127', 'Vacheron Constantin Overseas 41 4500V/110A-B127'),
  ('Vacheron Constantin', 'Patrimony', '4100U/000R-B180', 'Vacheron Constantin Patrimony 4100U/000R-B180'),
  ('Vacheron Constantin', 'Traditionnelle', '4100T/000R-B412', 'Vacheron Constantin Traditionnelle 4100T/000R-B412');
