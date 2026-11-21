const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_labour_connect_jwt_key_must_be_at_least_32_characters_long_for_hmac256';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(ApiResponse.error('Full authentication is required to access this resource'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded.sub;

    // Find by numeric id or email
    const user = await User.findOne({
      $or: [
        { id: isNaN(userId) ? -1 : Number(userId) },
        { email: String(userId).toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json(ApiResponse.error('User not found'));
    }

    if (user.suspended) {
      return res.status(401).json(ApiResponse.error('Account is suspended: ' + (user.suspensionReason || 'Please contact support.')));
    }

    if (!user.active) {
      return res.status(401).json(ApiResponse.error('Account has been deactivated.'));
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json(ApiResponse.error('Invalid or expired token: ' + err.message));
  }
}

// Optional auth: attaches req.user if present, but doesn't reject if omitted
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id || decoded.userId || decoded.sub;
      const user = await User.findOne({
        $or: [
          { id: isNaN(userId) ? -1 : Number(userId) },
          { email: String(userId).toLowerCase() }
        ]
      });
      if (user && user.active && !user.suspended) {
        req.user = user;
      }
    } catch (e) {
      // Ignore
    }
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };

