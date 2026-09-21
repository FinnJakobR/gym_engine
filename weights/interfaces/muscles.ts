export enum MuscleGroup {
  // --- BRUST (Chest) ---
  CHEST_UPPER = "CHEST_UPPER", // Clavicular Head (Obere Brust, z.B. Schrägbank)
  CHEST_MIDDLE = "CHEST_MIDDLE", // Sternal Head (Mittlere Brust)
  CHEST_LOWER = "CHEST_LOWER", // Abdominal Head (Untere Brust, z.B. Dips)

  // --- RÜCKEN (Back) ---
  LATS = "LATS", // Latissimus Dorsi (Breiter Rücken, z.B. Latzug)
  UPPER_BACK = "UPPER_BACK", // Rhomboids / Mid-Traps (Rhomboideen & Mittlerer Trapez)
  LOWER_BACK = "LOWER_BACK", // Erector Spinae (Rückenstrecker)
  TRAPS_UPPER = "TRAPS_UPPER", // Trapezius Upper (Nacken, z.B. Shrugs)

  // --- SCHULTERN (Shoulders / Delts) ---
  DELTS_ANTERIOR = "DELTS_ANTERIOR", // Vordere Schulter (Anterior Deltoid)
  DELTS_LATERAL = "DELTS_LATERAL", // Seitliche Schulter (Lateral Deltoid, z.B. Seitheben)
  DELTS_POSTERIOR = "DELTS_POSTERIOR", // Hintere Schulter (Posterior Deltoid / Reverse Flys)

  // --- ARME (Arms) ---
  BICEPS = "BICEPS", // Biceps Brachii (Köfpe)
  BRACHIALIS = "BRACHIALIS", // Brachialis (Unter Armbeuger, z.B. Hammer Curls)
  TRICEPS_LONG_HEAD = "TRICEPS_LONG", // Trizeps Langer Kopf (Überkopf-Lage)
  TRICEPS_LATERAL_MEDIAL = "TRICEPS_SHORT", // Trizeps Kurzer/Lateraler Kopf (Pushdowns)
  FOREARMS = "FOREARMS", // Unterarme (Grip / Flexors / Extensors)

  // --- BEINE (Legs) ---
  QUADRICEPS = "QUADRICEPS", // Beinstrecker (Quads)
  HAMSTRINGS = "HAMSTRINGS", // Beinbeuger (Posterior Chain)
  GLUTES = "GLUTES", // Gluteus Maximus/Medius (Gesäß)
  CALVES = "CALVES", // Gastrocnemius / Soleus (Waden)
  ADDUCTORS = "ADDUCTORS", // Adduktoren (Oberschenkel-Innenseite)
  ABDUCTORS = "ABDUCTORS", // Abduktoren (Oberschenkel-Außenseite)

  // --- RUMPF (Core) ---
  ABS = "ABS", // Rectus Abdominis (Gerade Bauchmuskeln)
  OBLIQUES = "OBLIQUES", // Seitliche Bauchmuskeln
}
