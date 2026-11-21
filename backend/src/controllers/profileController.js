const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const CustomerProfile = require('../models/CustomerProfile');
const ProviderProfile = require('../models/ProviderProfile');
const Skill = require('../models/Skill');
const ServiceCategory = require('../models/ServiceCategory');
const Review = require('../models/Review');
const { getNextSequenceValue } = require('../models/Counter');
const ApiResponse = require('../utils/apiResponse');

// Helper: calculate average rating and review count for a user
async function getUserRatingStats(userId) {
  const reviews = await Review.find({ revieweeId: userId });
  const reviewCount = reviews.length;
  if (reviewCount === 0) return { averageRating: 0.0, reviewCount: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Math.round((sum / reviewCount) * 10) / 10;
  return { averageRating, reviewCount };
}

// Mapper: Worker
async function mapWorkerToDto(worker, user) {
  if (!user) user = await User.findOne({ id: worker.userId });
  const skills = await Skill.find({ id: { $in: worker.skillIds || [] } });
  const { averageRating, reviewCount } = await getUserRatingStats(worker.userId);

  return {
    id: worker.id,
    userId: worker.userId,
    fullName: user ? user.fullName : '',
    email: user ? user.email : '',
    phone: user ? user.phoneNumber : '',
    headline: worker.headline || 'Skilled Worker',
    bio: worker.bio || '',
    yearsOfExperience: worker.yearsOfExperience || 0,
    dailyRate: worker.dailyRate,
    hourlyRate: worker.hourlyRate,
    city: worker.city || '',
    area: worker.area || '',
    latitude: worker.latitude,
    longitude: worker.longitude,
    availabilityStatus: worker.availabilityStatus || 'AVAILABLE',
    skillIds: worker.skillIds || [],
    skillNames: skills.map((s) => s.name),
    averageRating,
    reviewCount
  };
}

// Mapper: Employer
async function mapEmployerToDto(employer, user) {
  if (!user) user = await User.findOne({ id: employer.userId });
  const { averageRating, reviewCount } = await getUserRatingStats(employer.userId);

  return {
    id: employer.id,
    userId: employer.userId,
    companyName: employer.companyName,
    businessType: employer.businessType,
    address: employer.address || '',
    city: employer.city || '',
    contactPerson: employer.contactPerson || '',
    phone: employer.phone || '',
    email: user ? user.email : '',
    averageRating,
    reviewCount
  };
}

// Mapper: Customer
async function mapCustomerToDto(customer, user) {
  if (!user) user = await User.findOne({ id: customer.userId });

  return {
    id: customer.id,
    userId: customer.userId,
    fullName: user ? user.fullName : '',
    email: user ? user.email : '',
    phone: user ? user.phoneNumber : '',
    address: customer.address || '',
    city: customer.city || '',
    area: customer.area || '',
    latitude: customer.latitude,
    longitude: customer.longitude
  };
}

// Mapper: Provider
async function mapProviderToDto(provider, user) {
  if (!user) user = await User.findOne({ id: provider.userId });
  const categories = await ServiceCategory.find({ id: { $in: provider.categoryIds || [] } });
  const { averageRating, reviewCount } = await getUserRatingStats(provider.userId);

  return {
    id: provider.id,
    userId: provider.userId,
    fullName: user ? user.fullName : '',
    email: user ? user.email : '',
    phone: user ? user.phoneNumber : '',
    businessName: provider.businessName,
    bio: provider.bio || '',
    yearsOfExperience: provider.yearsOfExperience || 0,
    baseRate: provider.baseRate,
    hourlyRate: provider.hourlyRate,
    city: provider.city || '',
    serviceAreaRadiusKm: provider.serviceAreaRadiusKm || 15.0,
    latitude: provider.latitude,
    longitude: provider.longitude,
    verificationStatus: provider.verificationStatus || 'PENDING',
    verificationNotes: provider.verificationNotes || null,
    idProofUrl: provider.idProofUrl || null,
    verifiedAt: provider.verifiedAt || null,
    available: provider.available !== false,
    categoryIds: provider.categoryIds || [],
    categoryNames: categories.map((c) => c.name),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    averageRating,
    reviewCount,
    distanceKm: null
  };
}

// ================= WORKER CONTROLLERS =================
async function getWorkerProfile(req, res, next) {
  try {
    let worker = await WorkerProfile.findOne({ userId: req.user.id });
    if (!worker) {
      const id = await getNextSequenceValue('worker_profiles');
      worker = await WorkerProfile.create({ id, userId: req.user.id, headline: 'Skilled Worker' });
    }
    const dto = await mapWorkerToDto(worker, req.user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

async function updateWorkerProfile(req, res, next) {
  try {
    let worker = await WorkerProfile.findOne({ userId: req.user.id });
    if (!worker) {
      const id = await getNextSequenceValue('worker_profiles');
      worker = new WorkerProfile({ id, userId: req.user.id });
    }

    const { headline, bio, yearsOfExperience, dailyRate, hourlyRate, city, area, latitude, longitude, availabilityStatus, skillIds } = req.body;

    if (headline !== undefined) worker.headline = headline;
    if (bio !== undefined) worker.bio = bio;
    if (yearsOfExperience !== undefined) worker.yearsOfExperience = Number(yearsOfExperience) || 0;
    if (dailyRate !== undefined) worker.dailyRate = dailyRate != null ? Number(dailyRate) : null;
    if (hourlyRate !== undefined) worker.hourlyRate = hourlyRate != null ? Number(hourlyRate) : null;
    if (city !== undefined) worker.city = city;
    if (area !== undefined) worker.area = area;
    if (latitude !== undefined) worker.latitude = latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) worker.longitude = longitude != null ? Number(longitude) : null;
    if (availabilityStatus !== undefined) worker.availabilityStatus = availabilityStatus;
    if (skillIds !== undefined) worker.skillIds = Array.isArray(skillIds) ? skillIds.map(Number) : [];

    await worker.save();
    const dto = await mapWorkerToDto(worker, req.user);
    return res.status(200).json(ApiResponse.ok(dto, 'Worker profile updated.'));
  } catch (err) {
    next(err);
  }
}

// ================= EMPLOYER CONTROLLERS =================
async function getEmployerProfile(req, res, next) {
  try {
    let employer = await EmployerProfile.findOne({ userId: req.user.id });
    if (!employer) {
      const id = await getNextSequenceValue('employer_profiles');
      employer = await EmployerProfile.create({
        id,
        userId: req.user.id,
        companyName: `${req.user.fullName}'s Business`,
        contactPerson: req.user.fullName,
        phone: req.user.phoneNumber
      });
    }
    const dto = await mapEmployerToDto(employer, req.user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

async function updateEmployerProfile(req, res, next) {
  try {
    let employer = await EmployerProfile.findOne({ userId: req.user.id });
    if (!employer) {
      const id = await getNextSequenceValue('employer_profiles');
      employer = new EmployerProfile({ id, userId: req.user.id });
    }

    const { companyName, businessType, address, city, contactPerson, phone } = req.body;
    if (companyName !== undefined) employer.companyName = companyName;
    if (businessType !== undefined) employer.businessType = businessType;
    if (address !== undefined) employer.address = address;
    if (city !== undefined) employer.city = city;
    if (contactPerson !== undefined) employer.contactPerson = contactPerson;
    if (phone !== undefined) employer.phone = phone;

    await employer.save();
    const dto = await mapEmployerToDto(employer, req.user);
    return res.status(200).json(ApiResponse.ok(dto, 'Employer profile updated.'));
  } catch (err) {
    next(err);
  }
}

// ================= CUSTOMER CONTROLLERS =================
async function getCustomerProfile(req, res, next) {
  try {
    let customer = await CustomerProfile.findOne({ userId: req.user.id });
    if (!customer) {
      const id = await getNextSequenceValue('customer_profiles');
      customer = await CustomerProfile.create({ id, userId: req.user.id });
    }
    const dto = await mapCustomerToDto(customer, req.user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

async function updateCustomerProfile(req, res, next) {
  try {
    let customer = await CustomerProfile.findOne({ userId: req.user.id });
    if (!customer) {
      const id = await getNextSequenceValue('customer_profiles');
      customer = new CustomerProfile({ id, userId: req.user.id });
    }

    const { address, city, area, latitude, longitude } = req.body;
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (area !== undefined) customer.area = area;
    if (latitude !== undefined) customer.latitude = latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) customer.longitude = longitude != null ? Number(longitude) : null;

    await customer.save();
    const dto = await mapCustomerToDto(customer, req.user);
    return res.status(200).json(ApiResponse.ok(dto, 'Customer profile updated.'));
  } catch (err) {
    next(err);
  }
}

// ================= PROVIDER CONTROLLERS =================
async function getProviderProfile(req, res, next) {
  try {
    let provider = await ProviderProfile.findOne({ userId: req.user.id });
    if (!provider) {
      const id = await getNextSequenceValue('provider_profiles');
      provider = await ProviderProfile.create({
        id,
        userId: req.user.id,
        businessName: `${req.user.fullName} Services`,
        verificationStatus: 'PENDING',
        available: true
      });
    }
    const dto = await mapProviderToDto(provider, req.user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

async function updateProviderProfile(req, res, next) {
  try {
    let provider = await ProviderProfile.findOne({ userId: req.user.id });
    if (!provider) {
      const id = await getNextSequenceValue('provider_profiles');
      provider = new ProviderProfile({ id, userId: req.user.id });
    }

    const { businessName, bio, yearsOfExperience, baseRate, hourlyRate, city, serviceAreaRadiusKm, latitude, longitude, available, categoryIds } = req.body;

    if (businessName !== undefined) provider.businessName = businessName;
    if (bio !== undefined) provider.bio = bio;
    if (yearsOfExperience !== undefined) provider.yearsOfExperience = Number(yearsOfExperience) || 0;
    if (baseRate !== undefined) provider.baseRate = baseRate != null ? Number(baseRate) : null;
    if (hourlyRate !== undefined) provider.hourlyRate = hourlyRate != null ? Number(hourlyRate) : null;
    if (city !== undefined) provider.city = city;
    if (serviceAreaRadiusKm !== undefined) provider.serviceAreaRadiusKm = Number(serviceAreaRadiusKm) || 15.0;
    if (latitude !== undefined) provider.latitude = latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) provider.longitude = longitude != null ? Number(longitude) : null;
    if (available !== undefined) provider.available = Boolean(available);
    if (categoryIds !== undefined) provider.categoryIds = Array.isArray(categoryIds) ? categoryIds.map(Number) : [];

    await provider.save();
    const dto = await mapProviderToDto(provider, req.user);
    return res.status(200).json(ApiResponse.ok(dto, 'Provider profile updated.'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWorkerProfile,
  updateWorkerProfile,
  getEmployerProfile,
  updateEmployerProfile,
  getCustomerProfile,
  updateCustomerProfile,
  getProviderProfile,
  updateProviderProfile,
  mapWorkerToDto,
  mapEmployerToDto,
  mapCustomerToDto,
  mapProviderToDto,
  getUserRatingStats
};

