const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  jobId: { type: Number, required: true },
  workerId: { type: Number, required: true },
  coverNote: { type: String, trim: true },
  bidAmount: { type: Number, default: null },
  status: {
    type: String,
    enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    default: 'APPLIED'
  }
}, { timestamps: true });

jobApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

