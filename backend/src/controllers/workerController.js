const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const { mapWorkerToDto } = require('./profileController');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');

// GET /api/v1/workers (search workers)
async function searchWorkers(req, res, next) {
  try {
    const { city, availability, skillId, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};
    if (city && city.trim() && city.trim().toLowerCase() !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (availability && availability.trim() && availability.trim().toUpperCase() !== 'ALL') {
      filter.availabilityStatus = availability.trim().toUpperCase();
    }
    if (skillId && !isNaN(skillId)) {
      filter.skillIds = Number(skillId);
    }

    let workerList = await WorkerProfile.find(filter);

    // If query is provided, match headline or user full name
    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const userIds = workerList.map((w) => w.userId);
      const matchedUsers = await User.find({
        id: { $in: userIds },
        fullName: { $regex: qLower, $options: 'i' }
      });
      const matchedUserIds = new Set(matchedUsers.map((u) => u.id));

      workerList = workerList.filter((w) => {
        const matchesHeadline = w.headline && w.headline.toLowerCase().includes(qLower);
        const matchesName = matchedUserIds.has(w.userId);
        return matchesHeadline || matchesName;
      });
    }

    // Sort by years of experience descending
    workerList.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));

    const totalElements = workerList.length;
    const paginated = workerList.slice(page * size, (page + 1) * size);

    const users = await User.find({ id: { $in: paginated.map((w) => w.userId) } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const dtos = await Promise.all(
      paginated.map((w) => mapWorkerToDto(w, userMap.get(w.userId)))
    );

    const pageResponse = createPageResponse(dtos, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/workers/:userId
async function getWorkerByUserId(req, res, next) {
  try {
    const targetUserId = Number(req.params.userId);
    const worker = await WorkerProfile.findOne({ userId: targetUserId });
    if (!worker) {
      return res.status(404).json(ApiResponse.error('Worker profile not found for user: ' + targetUserId));
    }
    const user = await User.findOne({ id: targetUserId });
    const dto = await mapWorkerToDto(worker, user);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchWorkers,
  getWorkerByUserId
};

