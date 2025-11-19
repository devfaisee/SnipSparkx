const jwt = require('jsonwebtoken');

// Simple helper to check if someone is logged in with a valid token
module.exports = (req, res) => {
  const jwtSecret = process.env.JWT_SECRET || null;
  const adminUser = process.env.ADMIN_USER || null;

  // Make sure everything is set up properly first
  if(!jwtSecret || !adminUser) return false;

  // Look for the Authorization header (case insensitive)
  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  // Should be in format "Bearer <token>"
  const match = (''+authHeader).match(/^Bearer\s+(.+)$/i);
  if(!match) return false;

  const token = match[1];
  try{
    // Verify the token hasn't been tampered with
    const payload = jwt.verify(token, jwtSecret);
    return payload;
  }catch(e){
    // Token is invalid or expired
    return false;
  }
};
