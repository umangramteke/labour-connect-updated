const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, unique: true },
  headline: { type: String, trim: true, default: 'Skilled Worker' },
  bio: { type: String, trim: true },
  yearsOfExperience: { type: Number, default: 0 },
  dailyRate: { type: Number, default: null },
  hourlyRate: { type: Number, default: null },
  city: { type: String, trim: true },
  area: { type: String, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  availabilityStatus: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'],
    default: 'AVAILABLE'
  },
  skillIds: [{ type: Number }]
}, { timestamps: true });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);

