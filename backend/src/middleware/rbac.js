const ApiResponse = require('../utils/apiResponse');

function normalizeRole(role) {
  return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
}

function hasRole(requiredRole) {
  const normalized = normalizeRole(requiredRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Authentication required'));
    }
    const userRoles = req.user.roles.map(normalizeRole);
    if (!userRoles.includes(normalized)) {
      return res.status(403).json(ApiResponse.error('Access Denied: You do not have sufficient privileges to perform this operation.'));
    }
    next();
  };
}

function hasAnyRole(...requiredRoles) {
  const normalizedRoles = requiredRoles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Authentication required'));
    }
    const userRoles = req.user.roles.map(normalizeRole);
    const hasMatch = normalizedRoles.some((r) => userRoles.includes(r));
    if (!hasMatch) {
      return res.status(403).json(ApiResponse.error('Access Denied: You do not have sufficient privileges to perform this operation.'));
    }
    next();
  };
}

module.exports = { hasRole, hasAnyRole };

