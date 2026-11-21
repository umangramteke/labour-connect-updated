const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  reviewerId: { type: Number, required: true },
  revieweeId: { type: Number, required: true },
  jobId: { type: Number, default: null },
  serviceRequestId: { type: Number, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

