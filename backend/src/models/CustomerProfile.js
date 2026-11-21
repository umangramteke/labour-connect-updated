const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, unique: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  area: { type: String, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);

