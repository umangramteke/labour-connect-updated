const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  roles: [{ type: String, required: true }], // e.g. 'ROLE_WORKER', 'ROLE_ADMIN'
  active: { type: Boolean, default: true },
  suspended: { type: Boolean, default: false },
  suspensionReason: { type: String, default: null }
}, { timestamps: true });

userSchema.methods.toSummaryDto = function () {
  return {
    id: this.id,
    email: this.email,
    fullName: this.fullName,
    phoneNumber: this.phoneNumber,
    roles: this.roles,
    active: this.active,
    suspended: this.suspended,
    suspensionReason: this.suspensionReason
  };
};

module.exports = mongoose.model('User', userSchema);

