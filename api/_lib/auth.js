const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  const jwtSecret = process.env.JWT_SECRET || null;
  const adminUser = process.env.ADMIN_USER || null;

  // If auth not configured, fail secure
  if(!jwtSecret || !adminUser) return false;

  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  const match = (''+authHeader).match(/^Bearer\s+(.+)$/i);
  if(!match) return false;

  const token = match[1];
  try{
    const payload = jwt.verify(token, jwtSecret);
    return payload;
  }catch(e){
    return false;
  }
};
