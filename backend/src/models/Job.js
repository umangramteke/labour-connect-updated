const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  employerId: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  jobType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY_WAGE', 'REGULAR', 'REGULAR_EMPLOYMENT'],
    default: 'DAILY_WAGE'
  },
  dailyWage: { type: Number, default: null },
  minMonthlySalary: { type: Number, default: null },
  maxMonthlySalary: { type: Number, default: null },
  workingHours: { type: String, default: null },
  estimatedDays: { type: Number, default: 1 },
  city: { type: String, required: true, trim: true },
  area: { type: String, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'],
    default: 'OPEN'
  },
  requiredSkillIds: [{ type: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);

