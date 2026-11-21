const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  customerId: { type: Number, required: true },
  providerId: { type: Number, required: true },
  categoryId: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  serviceAddress: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  scheduledAt: { type: Date, default: null },
  estimatedCost: { type: Number, default: null },
  finalCost: { type: Number, default: null },
  status: {
    type: String,
    enum: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'SERVICE_STARTED', 'COMPLETED', 'REJECTED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  rejectionReason: { type: String, default: null },
  cancellationReason: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

