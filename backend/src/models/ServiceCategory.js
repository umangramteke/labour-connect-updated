const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  iconName: { type: String, trim: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);

