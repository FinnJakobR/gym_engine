-- Seed-Daten für die definierten Maschinen einfügen
INSERT INTO maschines (name, exercise_def_id, increment_step, max_reps) VALUES
    ('Beinpresse 45°', 'leg_press', 5.0, 10),
    ('Schulterpresse', 'shoulder_press_machine', 2.5, 10),
    ('Beinbeuger (Leg Curl)', 'leg_curl_machine', 2.5, 12),
    ('Butterfly (Peck Deck)', 'butterfly_machine', 2.5, 12),
    ('Seitheben (Maschine / Kabel)', 'lateral_raise_machine', 1.25, 15),
    ('Dips', 'dips', 2.5, 10),
    ('Klimmzüge (Pull-Ups)', 'pull_ups', 2.5, 10);