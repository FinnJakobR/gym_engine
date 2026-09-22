-- 1. Maschinen / Geräte
CREATE TABLE IF NOT EXISTS maschines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                     -- z.B. "Gym-A Hammer Strength Presse"
    exercise_def_id TEXT NOT NULL UNIQUE,          -- Verweis auf "chest_press_machine" aus exerciseDefinition.ts
    increment_step REAL DEFAULT 2.5,        -- Gerätespezifisches Steigerungsintervall
    max_reps INTEGER DEFAULT 10             -- Gerätespezifischer Ziel-Rep-Threshold
);

-- 2. Das Workout (Gesamte Session)
CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start DATETIME DEFAULT CURRENT_TIMESTAMP,
    end DATETIME                            -- NULL solange das Workout aktiv ist
);

-- 3. Übungs-Instanz im Workout (Session-Exercise)
CREATE TABLE IF NOT EXISTS ex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,            -- Zu welchem Workout gehört die Übung?
    maschine_id INTEGER NOT NULL,            -- Welche Maschine wurde genutzt?
    order_index INTEGER NOT NULL DEFAULT 1, -- Reihenfolge im Workout (1., 2., 3. Übung...)
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (maschine_id) REFERENCES maschines(id) ON DELETE CASCADE
);

-- 4. Einzelne Sätze pro Übungs-Instanz
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ex_id INTEGER NOT NULL,                 -- Verweis auf die Übungs-Instanz
    maschine_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,            -- Satznummer (1, 2, 3...)
    weight REAL NOT NULL,                   -- REAL für 2.5kg Schritte
    reps INTEGER NOT NULL,
    rir INTEGER,                            -- Reps in Reserve (optional)
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ex_id) REFERENCES ex(id) ON DELETE CASCADE
);

-- 5. KI / NN Trainings-Logs (Features -> Label)
CREATE TABLE IF NOT EXISTS nn_training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maschine_id INTEGER NOT NULL,
    
    -- X: Die 6 normierten Features [0.0 bis 1.0]
    f_performance REAL NOT NULL,
    f_staleness REAL NOT NULL,
    f_antagonist REAL NOT NULL,
    f_primary REAL NOT NULL,
    f_synergist REAL NOT NULL,
    f_maschine REAL NOT NULL,
    
    -- Heuristik-Score der linearen Engine
    calculated_score REAL NOT NULL,
    
    -- Y: Das spätere Label für das NN
    e1rm_before REAL NOT NULL,          -- e1RM vor dem Satz
    e1rm_achieved REAL,                 -- e1RM in diesem Satz
    e1rm_delta REAL,                    -- Relative Steigerung (z.B. +0.025 für +2.5%)
    
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maschine_id) REFERENCES maschines(id) ON DELETE CASCADE
);