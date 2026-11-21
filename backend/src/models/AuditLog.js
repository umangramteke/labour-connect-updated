const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, default: null },
  action: { type: String, required: true },
  entityName: { type: String, required: true },
  entityId: { type: Number, default: null },
  details: { type: String, default: null },
  ipAddress: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

