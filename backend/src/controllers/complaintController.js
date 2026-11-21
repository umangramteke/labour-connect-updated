const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { getNextSequenceValue } = require('../models/Counter');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');
const { logEvent } = require('../utils/auditLogger');

// Helper: map Complaint to DTO
async function mapComplaintToDto(c, complainant, reportedUser, resolvedByAdmin) {
  if (!complainant) complainant = await User.findOne({ id: c.complainantId });
  if (!reportedUser) reportedUser = await User.findOne({ id: c.reportedUserId });
  if (c.resolvedByAdminId && !resolvedByAdmin) resolvedByAdmin = await User.findOne({ id: c.resolvedByAdminId });

  return {
    id: c.id,
    complainantId: c.complainantId,
    complainantName: complainant ? complainant.fullName : '',
    reportedUserId: c.reportedUserId,
    reportedUserName: reportedUser ? reportedUser.fullName : '',
    serviceRequestId: c.serviceRequestId || null,
    jobId: c.jobId || null,
    subject: c.subject,
    description: c.description,
    status: c.status,
    adminResolutionNotes: c.adminResolutionNotes || null,
    resolvedByAdminId: c.resolvedByAdminId || null,
    resolvedByAdminName: resolvedByAdmin ? resolvedByAdmin.fullName : null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  };
}

// POST /api/v1/complaints
async function fileComplaint(req, res, next) {
  try {
    const complainantUserId = req.user.id;
    const { reportedUserId, serviceRequestId, jobId, subject, description } = req.body;

    if (!reportedUserId || !subject || !description) {
      return res.status(400).json(ApiResponse.error('Reported user ID, subject, and description are required.'));
    }

    if (complainantUserId === Number(reportedUserId)) {
      return res.status(400).json(ApiResponse.error('You cannot file a complaint against yourself.'));
    }

    const reportedUser = await User.findOne({ id: Number(reportedUserId) });
    if (!reportedUser) {
      return res.status(404).json(ApiResponse.error('Reported user not found'));
    }

    const id = await getNextSequenceValue('complaints');
    const complaint = await Complaint.create({
      id,
      complainantId: complainantUserId,
      reportedUserId: reportedUser.id,
      serviceRequestId: serviceRequestId ? Number(serviceRequestId) : null,
      jobId: jobId ? Number(jobId) : null,
      subject: subject.trim(),
      description: description.trim(),
      status: 'PENDING'
    });

    await logEvent(req.user, 'FILE_COMPLAINT', 'Complaint', complaint.id, `Complaint filed against ${reportedUser.email}`, req);

    const dto = await mapComplaintToDto(complaint, req.user, reportedUser, null);
    return res.status(200).json(ApiResponse.ok(dto, 'Complaint registered successfully. Admin will investigate.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/complaints/my
async function getMyComplaints(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const totalElements = await Complaint.countDocuments({ complainantId: req.user.id });
    const complaints = await Complaint.find({ complainantId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const reportedIds = [...new Set(complaints.map((c) => c.reportedUserId))];
    const reportedUsers = await User.find({ id: { $in: reportedIds } });
    const userMap = new Map(reportedUsers.map((u) => [u.id, u]));

    const dtos = await Promise.all(
      complaints.map((c) => mapComplaintToDto(c, req.user, userMap.get(c.reportedUserId), null))
    );

    const pageResponse = createPageResponse(dtos, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  fileComplaint,
  getMyComplaints,
  mapComplaintToDto
};

