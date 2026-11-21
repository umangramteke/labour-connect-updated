const User = require('../models/User');
const Job = require('../models/Job');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const { mapProviderToDto } = require('./profileController');
const { mapComplaintToDto } = require('./complaintController');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');
const { logEvent } = require('../utils/auditLogger');

// GET /api/v1/admin/stats
async function getStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true, suspended: false });
    const suspendedUsers = await User.countDocuments({ suspended: true });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'OPEN' });
    const totalServiceRequests = await ServiceRequest.countDocuments();
    const completedServiceRequests = await ServiceRequest.countDocuments({ status: 'COMPLETED' });
    const pendingVerifications = await ProviderProfile.countDocuments({ verificationStatus: 'PENDING' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'PENDING' });

    const stats = {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalJobs,
      openJobs,
      totalServiceRequests,
      completedServiceRequests,
      pendingVerifications,
      pendingComplaints
    };

    return res.status(200).json(ApiResponse.ok(stats));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/users
async function listUsers(req, res, next) {
  try {
    const { role, status, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};

    if (role && role.trim() && role.trim().toUpperCase() !== 'ALL') {
      const cleanRole = role.trim().toUpperCase();
      const roleName = cleanRole.startsWith('ROLE_') ? cleanRole : `ROLE_${cleanRole}`;
      filter.roles = roleName;
    }

    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      const st = status.trim().toUpperCase();
      if (st === 'ACTIVE') {
        filter.active = true;
        filter.suspended = false;
      } else if (st === 'SUSPENDED') {
        filter.suspended = true;
      } else if (st === 'INACTIVE' || st === 'DEACTIVATED') {
        filter.active = false;
      }
    }

    if (query && query.trim()) {
      const pattern = new RegExp(query.trim(), 'i');
      filter.$or = [{ fullName: pattern }, { email: pattern }, { phoneNumber: pattern }];
    }

    const totalElements = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const summaries = users.map((u) => u.toSummaryDto());
    const pageResponse = createPageResponse(summaries, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/admin/users/:id/status
async function updateUserStatus(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    if (req.user.id === targetUserId) {
      return res.status(400).json(ApiResponse.error('Administrators cannot suspend their own administrative account.'));
    }

    const user = await User.findOne({ id: targetUserId });
    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found with id: ' + targetUserId));
    }

    const { suspended, suspensionReason } = req.body;
    user.suspended = Boolean(suspended);
    user.suspensionReason = Boolean(suspended) ? (suspensionReason || 'Suspended by administrator') : null;

    await user.save();
    await logEvent(req.user, suspended ? 'SUSPEND_USER' : 'REACTIVATE_USER', 'User', user.id, `User suspension updated: ${suspended}`, req);

    return res.status(200).json(ApiResponse.ok(user.toSummaryDto(), 'User status updated.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/verifications
async function getVerifications(req, res, next) {
  try {
    const { status, categoryId, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.verificationStatus = status.trim().toUpperCase();
    }
    if (categoryId && !isNaN(categoryId)) {
      filter.categoryIds = Number(categoryId);
    }

    let providers = await ProviderProfile.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const userIds = providers.map((p) => p.userId);
      const users = await User.find({ id: { $in: userIds } });
      const userMap = new Map(users.map((u) => [u.id, u]));

      providers = providers.filter((p) => {
        const u = userMap.get(p.userId);
        const bMatch = p.businessName && p.businessName.toLowerCase().includes(qLower);
        const cMatch = p.city && p.city.toLowerCase().includes(qLower);
        const nameMatch = u && u.fullName.toLowerCase().includes(qLower);
        const emailMatch = u && u.email.toLowerCase().includes(qLower);
        return bMatch || cMatch || nameMatch || emailMatch;
      });
    }

    const totalElements = providers.length;
    const paginated = providers.slice(page * size, (page + 1) * size);

    const users = await User.find({ id: { $in: paginated.map((p) => p.userId) } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const dtos = await Promise.all(paginated.map((p) => mapProviderToDto(p, userMap.get(p.userId))));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/admin/verifications/:id
async function decideVerification(req, res, next) {
  try {
    const providerId = Number(req.params.id);
    const provider = await ProviderProfile.findOne({ id: providerId });
    if (!provider) {
      return res.status(404).json(ApiResponse.error('Provider not found with id: ' + providerId));
    }

    const { status, notes } = req.body;
    const cleanStatus = (status || '').toUpperCase();
    if (cleanStatus !== 'APPROVED' && cleanStatus !== 'REJECTED' && cleanStatus !== 'PENDING') {
      return res.status(400).json(ApiResponse.error('Invalid verification status: ' + status));
    }

    provider.verificationStatus = cleanStatus;
    provider.verificationNotes = notes || null;
    provider.verifiedAt = cleanStatus === 'APPROVED' ? new Date() : null;

    await provider.save();
    await logEvent(req.user, 'DECIDE_VERIFICATION', 'ProviderProfile', provider.id, `Verification set to ${cleanStatus}`, req);

    const user = await User.findOne({ id: provider.userId });
    const dto = await mapProviderToDto(provider, user);

    return res.status(200).json(ApiResponse.ok(dto, 'Verification decision processed.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/complaints
async function listComplaints(req, res, next) {
  try {
    const { status, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }

    let complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const userIds = [
        ...new Set([
          ...complaints.map((c) => c.complainantId),
          ...complaints.map((c) => c.reportedUserId)
        ])
      ];
      const users = await User.find({ id: { $in: userIds } });
      const userMap = new Map(users.map((u) => [u.id, u]));

      complaints = complaints.filter((c) => {
        const compUser = userMap.get(c.complainantId);
        const repUser = userMap.get(c.reportedUserId);
        const subMatch = c.subject && c.subject.toLowerCase().includes(qLower);
        const descMatch = c.description && c.description.toLowerCase().includes(qLower);
        const compMatch = compUser && compUser.fullName.toLowerCase().includes(qLower);
        const repMatch = repUser && repUser.fullName.toLowerCase().includes(qLower);
        return subMatch || descMatch || compMatch || repMatch;
      });
    }

    const totalElements = complaints.length;
    const paginated = complaints.slice(page * size, (page + 1) * size);

    const allUserIds = [
      ...new Set([
        ...paginated.map((c) => c.complainantId),
        ...paginated.map((c) => c.reportedUserId),
        ...paginated.map((c) => c.resolvedByAdminId).filter(Boolean)
      ])
    ];
    const users = await User.find({ id: { $in: allUserIds } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const dtos = await Promise.all(
      paginated.map((c) =>
        mapComplaintToDto(
          c,
          userMap.get(c.complainantId),
          userMap.get(c.reportedUserId),
          userMap.get(c.resolvedByAdminId)
        )
      )
    );

    const pageResponse = createPageResponse(dtos, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/admin/complaints/:id
async function resolveComplaint(req, res, next) {
  try {
    const complaintId = Number(req.params.id);
    const complaint = await Complaint.findOne({ id: complaintId });
    if (!complaint) {
      return res.status(404).json(ApiResponse.error('Complaint not found with id: ' + complaintId));
    }

    const { status, adminResolutionNotes } = req.body;
    complaint.status = (status || 'RESOLVED').toUpperCase();
    complaint.adminResolutionNotes = adminResolutionNotes || '';
    complaint.resolvedByAdminId = req.user.id;

    await complaint.save();
    await logEvent(req.user, 'RESOLVE_COMPLAINT', 'Complaint', complaint.id, `Complaint status set to ${complaint.status}`, req);

    const complainant = await User.findOne({ id: complaint.complainantId });
    const reportedUser = await User.findOne({ id: complaint.reportedUserId });
    const dto = await mapComplaintToDto(complaint, complainant, reportedUser, req.user);

    return res.status(200).json(ApiResponse.ok(dto, 'Complaint updated successfully.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/admin/audit-logs
async function getAuditLogs(req, res, next) {
  try {
    const { action, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};
    if (action && action.trim() && action.trim().toUpperCase() !== 'ALL') {
      filter.action = action.trim();
    }
    if (query && query.trim()) {
      const pattern = new RegExp(query.trim(), 'i');
      filter.$or = [{ details: pattern }, { entityName: pattern }, { ipAddress: pattern }];
    }

    const totalElements = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const pageResponse = createPageResponse(logs, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  listUsers,
  updateUserStatus,
  getVerifications,
  decideVerification,
  listComplaints,
  resolveComplaint,
  getAuditLogs
};

