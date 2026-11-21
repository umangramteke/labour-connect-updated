const AuditLog = require('../models/AuditLog');
const { getNextSequenceValue } = require('../models/Counter');

async function logEvent(user, action, entityName, entityId, details, req = null) {
  try {
    const id = await getNextSequenceValue('audit_logs');
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    const logEntry = new AuditLog({
      id,
      userId: user ? user.id : null,
      action,
      entityName,
      entityId,
      details,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '127.0.0.1'
    });

    await logEntry.save();
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logEvent };

