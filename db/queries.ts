export const DAYS_SINCE_LAST_TRAINED_QUERY = `SELECT date FROM ex WHERE maschine_id = ? ORDER BY date DESC LIMIT 1;`;
export const TIMES_PERFORMED_IN_LAST_14_DAYS_QUERY = `SELECT * FROM records WHERE maschine_id = ? ORDER BY date DESC`;
export const GET_ALL_MASCHINES = `SELECT * FROM maschines`;
export const GET_N_LAST_RECORDS = `SELECT * FROM records WHERE maschine_id = ? AND is_warmup = 0 ORDER BY date DESC LIMIT ? `;
export const GET_ALL_EXERCISES = `SELECT date FROM ex WHERE maschine_id = ?`;
export const INSERT_RECORD = `INSERT INTO records (ex_id, maschine_id, set_number, weight, reps, rir, is_warmup) VALUES (?,?,?,?,?,?,?)`;
export const GET_PREVIOUS_1ERM = `SELECT e1rm_achieved FROM nn_training_logs WHERE maschine_id = ? ORDER BY date DESC LIMIT 1`;
export const INSERT_NN_TRAINING_SET = `INSERT INTO nn_training_logs (
    maschine_id, 
    f_performance, 
    f_staleness, 
    f_antagonist, 
    f_primary, 
    f_synergist, 
    f_maschine, 
    calculated_score, 
    e1rm_before,
    e1rm_achieved,
    e1rm_delta
) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

export const INSERT_EXERCISES = `INSERT INTO ex (maschine_id, workout_id) VALUES(?,?)`;
export const INSERT_WORKOUT = `INSERT INTO workouts (start, end) VALUES(?,?)`;
export const END_WORKOUT_QUERY = `UPDATE workouts SET end = ? WHERE id = ? `;
export const GET_ALL_RECORDS_MASCHINE = `SELECT * FROM records WHERE maschine_id = ? AND is_warmup = 0 ORDER BY date DESC`;
export const GET_ALL_TRAININGS_DATE = `SELECT * FROM nn_training_logs WHERE e1rm_delta IS NOT NULL"`;
