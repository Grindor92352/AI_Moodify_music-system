const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'moodify_super_secret_key_123';

const generateCookie = (res, email) => {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt_token', token, {
    httpOnly: true,
    secure: false, // set true if using https in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.signup = async (req, res) => {
  try {
    const { email, password, name, age, preferredSingers } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const db = await getDb();
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Securely hash the password before saving to DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const singersStr = preferredSingers ? JSON.stringify(preferredSingers) : null;
    
    await db.query(
      'INSERT INTO users (email, password, name, age, preferred_singers) VALUES ($1, $2, $3, $4, $5)',
      [email, hashedPassword, name || null, age || null, singersStr || null]
    );
    
    generateCookie(res, email);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();
    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    
    // For seamless testing, if they login without signing up, let's just create them on the fly
    if (!user) {
       const hashedPassword = await bcrypt.hash(password, 10);
       await db.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
       user = { email, password: hashedPassword };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    generateCookie(res, email);
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt_token');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.verify = async (req, res) => {
  const token = req.cookies.jwt_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [decoded.email]);
    const user = result.rows[0];
    
    if (!user) {
       // Return valid true to gracefully handle manually created Google OAuth mocked users
       return res.status(200).json({ email: decoded.email, valid: true });
    }

    res.status(200).json({ 
      email: user.email, 
      name: user.name, 
      age: user.age, 
      preferredSingers: user.preferred_singers ? JSON.parse(user.preferred_singers) : [],
      valid: true 
    });
  } catch (err) {
    res.clearCookie('jwt_token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const email = 'google_oauth_user@gmail.com';
    const db = await getDb();
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('oauth_dummy_pass', 10);
      await db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3)', [email, hashedPassword, 'Google User']);
    }

    generateCookie(res, email);
    res.redirect('http://localhost:3000/profile');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
};
