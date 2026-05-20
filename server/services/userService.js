const { pool } = require('../database');

async function loadPreferredSingers(email) {
  const result = await pool.query(
    `SELECT singer_name FROM user_preferred_singers
     WHERE user_email = $1 ORDER BY singer_name ASC`,
    [email]
  );
  return result.rows.map(r => r.singer_name);
}

async function replacePreferredSingers(email, singers) {
  await pool.query('DELETE FROM user_preferred_singers WHERE user_email = $1', [email]);
  if (!singers?.length) return;
  for (const singer of singers) {
    await pool.query(
      `INSERT INTO user_preferred_singers (user_email, singer_name)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [email, singer]
    );
  }
}

async function loadUserProfile(email) {
  const result = await pool.query(
    'SELECT email, name, age FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];
  if (!user) return null;

  const preferredSingers = await loadPreferredSingers(email);
  return {
    email: user.email,
    name: user.name,
    age: user.age,
    preferredSingers
  };
}

module.exports = {
  loadPreferredSingers,
  replacePreferredSingers,
  loadUserProfile
};
