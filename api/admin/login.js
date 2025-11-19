const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  console.log('\n[ADMIN LOGIN] Request received');
  console.log('[ADMIN LOGIN] Method:', req.method);
  
  if(req.method !== 'POST'){
    console.log('[ADMIN LOGIN] ❌ Method not allowed:', req.method);
    res.statusCode = 405; res.setHeader('Allow','POST'); return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { user, pass } = req.body || {};
  console.log('[ADMIN LOGIN] Login attempt for user:', user);
  
  const adminUser = process.env.ADMIN_USER || null;
  const adminPassHash = process.env.ADMIN_PASS_HASH || null; // bcrypt hash stored in env
  const jwtSecret = process.env.JWT_SECRET || null;

  if(!adminUser || !adminPassHash || !jwtSecret){
    console.log('[ADMIN LOGIN] ❌ Server not configured (missing env variables)');
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Server not configured for admin auth. Please set ADMIN_USER, ADMIN_PASS_HASH and JWT_SECRET environment variables.' }));
  }

  if(!user || !pass){ 
    console.log('[ADMIN LOGIN] ❌ Missing credentials');
    res.statusCode = 400; return res.end(JSON.stringify({ error: 'Missing credentials' })); 
  }

  console.log('[ADMIN LOGIN] Verifying username...');
  if(user !== adminUser){ 
    console.log('[ADMIN LOGIN] ❌ Invalid username');
    res.statusCode = 401; return res.end(JSON.stringify({ error: 'Invalid credentials' })); 
  }
  console.log('[ADMIN LOGIN] ✓ Username verified');

  console.log('[ADMIN LOGIN] Verifying password (bcrypt)...');
  const ok = await bcrypt.compare(pass, adminPassHash);
  if(!ok){ 
    console.log('[ADMIN LOGIN] ❌ Password verification failed');
    res.statusCode = 401; return res.end(JSON.stringify({ error: 'Invalid credentials' })); 
  }
  console.log('[ADMIN LOGIN] ✓ Password verified');

  // Issue JWT (1 hour)
  console.log('[ADMIN LOGIN] Generating JWT token (expires in 1h)...');
  const token = jwt.sign({ user }, jwtSecret, { expiresIn: '1h' });
  console.log('[ADMIN LOGIN] ✓ JWT token generated');
  
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  console.log('[ADMIN LOGIN] → Response sent: 200 OK (token provided)');
  return res.end(JSON.stringify({ token }));
};
