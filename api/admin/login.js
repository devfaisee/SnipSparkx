const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if(req.method !== 'POST'){
    res.statusCode = 405; res.setHeader('Allow','POST'); return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { user, pass } = req.body || {};
  const adminUser = process.env.ADMIN_USER || null;
  const adminPassHash = process.env.ADMIN_PASS_HASH || null; // bcrypt hash stored in env
  const jwtSecret = process.env.JWT_SECRET || null;

  if(!adminUser || !adminPassHash || !jwtSecret){
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Server not configured for admin auth. Please set ADMIN_USER, ADMIN_PASS_HASH and JWT_SECRET environment variables.' }));
  }

  if(!user || !pass){ res.statusCode = 400; return res.end(JSON.stringify({ error: 'Missing credentials' })); }

  if(user !== adminUser){ res.statusCode = 401; return res.end(JSON.stringify({ error: 'Invalid credentials' })); }

  const ok = await bcrypt.compare(pass, adminPassHash);
  if(!ok){ res.statusCode = 401; return res.end(JSON.stringify({ error: 'Invalid credentials' })); }

  // Issue JWT (1 hour)
  const token = jwt.sign({ user }, jwtSecret, { expiresIn: '1h' });
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  return res.end(JSON.stringify({ token }));
};
