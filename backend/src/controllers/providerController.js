const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { mapProviderToDto } = require('./profileController');
const { calculateHaversineDistanceKm } = require('../utils/haversine');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');

// GET /api/v1/services/providers
async function searchProviders(req, res, next) {
  try {
    const { categoryId, city, query, lat, lng, radiusKm } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 12;

    const filter = {
      verificationStatus: 'APPROVED',
      available: true
    };

    if (categoryId && !isNaN(categoryId)) {
      filter.categoryIds = Number(categoryId);
    }

    if (city && city.trim() && city.trim().toLowerCase() !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (query && query.trim()) {
      filter.businessName = { $regex: query.trim(), $options: 'i' };
    }

    let providers = await ProviderProfile.find(filter);

    const userLat = lat != null ? Number(lat) : null;
    const userLng = lng != null ? Number(lng) : null;
    const maxRadius = radiusKm != null ? Number(radiusKm) : null;

    const users = await User.find({ id: { $in: providers.map((p) => p.userId) } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    let dtos = await Promise.all(
      providers.map(async (p) => {
        const dto = await mapProviderToDto(p, userMap.get(p.userId));
        if (userLat != null && userLng != null && dto.latitude != null && dto.longitude != null) {
          dto.distanceKm = calculateHaversineDistanceKm(userLat, userLng, dto.latitude, dto.longitude);
        }
        return dto;
      })
    );

    if (maxRadius != null) {
      dtos = dtos.filter((d) => d.distanceKm == null || d.distanceKm <= maxRadius);
    }

    // Sort by distance if location provided, else by id
    if (userLat != null && userLng != null) {
      dtos.sort((a, b) => (a.distanceKm != null ? a.distanceKm : 999999) - (b.distanceKm != null ? b.distanceKm : 999999));
    } else {
      dtos.sort((a, b) => a.id - b.id);
    }

    const totalElements = dtos.length;
    const paginated = dtos.slice(page * size, (page + 1) * size);

    const pageResponse = createPageResponse(paginated, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/services/providers/:userId
async function getProviderByUserId(req, res, next) {
  try {
    const targetUserId = Number(req.params.userId);
    const provider = await ProviderProfile.findOne({ userId: targetUserId });
    if (!provider) {
      return res.status(404).json(ApiResponse.error('Provider profile not found for user: ' + targetUserId));
    }
    const user = await User.findOne({ id: targetUserId });
    const dto = await mapProviderToDto(provider, user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchProviders,
  getProviderByUserId
};

