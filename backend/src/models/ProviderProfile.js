const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  bio: { type: String, trim: true },
  yearsOfExperience: { type: Number, default: 0 },
  baseRate: { type: Number, default: null },
  hourlyRate: { type: Number, default: null },
  city: { type: String, trim: true },
  serviceAreaRadiusKm: { type: Number, default: 15.0 },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  verificationNotes: { type: String, default: null },
  idProofUrl: { type: String, default: null },
  verifiedAt: { type: Date, default: null },
  available: { type: Boolean, default: true },
  categoryIds: [{ type: Number }]
}, { timestamps: true });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);

