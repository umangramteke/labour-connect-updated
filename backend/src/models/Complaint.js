const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  complainantId: { type: Number, required: true },
  reportedUserId: { type: Number, required: true },
  serviceRequestId: { type: Number, default: null },
  jobId: { type: Number, default: null },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING'
  },
  adminResolutionNotes: { type: String, default: null },
  resolvedByAdminId: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

