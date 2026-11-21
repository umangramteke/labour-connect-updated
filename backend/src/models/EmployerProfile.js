const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  businessType: {
    type: String,
    enum: ['INDIVIDUAL', 'SHOPKEEPER', 'CONTRACTOR', 'ENTERPRISE'],
    default: 'INDIVIDUAL'
  },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  phone: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);

