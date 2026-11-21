const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const EmployerProfile = require('../models/EmployerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Review = require('../models/Review');
const { getNextSequenceValue } = require('../models/Counter');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');
const { logEvent } = require('../utils/auditLogger');
const { getUserRatingStats } = require('./profileController');

// Helper: map Job to JobDto
async function mapJobToDto(job, employer) {
  if (!employer) employer = await EmployerProfile.findOne({ id: job.employerId });
  const skills = await Skill.find({ id: { $in: job.requiredSkillIds || [] } });
  const appCount = await JobApplication.countDocuments({ jobId: job.id });

  return {
    id: job.id,
    employerId: job.employerId,
    employerUserId: employer ? employer.userId : null,
    employerCompanyName: employer ? employer.companyName : '',
    employerContactPerson: employer ? employer.contactPerson : '',
    employerCity: employer ? employer.city : '',
    title: job.title,
    description: job.description,
    jobType: job.jobType,
    dailyWage: job.dailyWage,
    minMonthlySalary: job.minMonthlySalary,
    maxMonthlySalary: job.maxMonthlySalary,
    workingHours: job.workingHours,
    estimatedDays: job.estimatedDays,
    city: job.city,
    area: job.area,
    latitude: job.latitude,
    longitude: job.longitude,
    status: job.status,
    requiredSkillIds: job.requiredSkillIds || [],
    requiredSkillNames: skills.map((s) => s.name),
    applicationCount: appCount,
    createdAt: job.createdAt
  };
}

// Helper: map JobApplication to JobApplicationDto
async function mapApplicationToDto(app, job, worker) {
  if (!job) job = await Job.findOne({ id: app.jobId });
  const employer = job ? await EmployerProfile.findOne({ id: job.employerId }) : null;
  if (!worker) worker = await WorkerProfile.findOne({ id: app.workerId });
  const workerUser = worker ? await User.findOne({ id: worker.userId }) : null;
  const skills = worker ? await Skill.find({ id: { $in: worker.skillIds || [] } }) : [];
  const { averageRating } = worker ? await getUserRatingStats(worker.userId) : { averageRating: 0 };

  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: job ? job.title : '',
    jobType: job ? job.jobType : '',
    jobCity: job ? job.city : '',
    jobDailyWage: job ? job.dailyWage : null,
    jobMinMonthlySalary: job ? job.minMonthlySalary : null,
    jobMaxMonthlySalary: job ? job.maxMonthlySalary : null,
    jobWorkingHours: job ? job.workingHours : null,
    employerCompanyName: employer ? employer.companyName : '',
    workerId: app.workerId,
    workerUserId: worker ? worker.userId : null,
    workerFullName: workerUser ? workerUser.fullName : '',
    workerPhone: workerUser ? workerUser.phoneNumber : '',
    workerHeadline: worker ? worker.headline : '',
    workerYearsOfExperience: worker ? worker.yearsOfExperience : 0,
    workerSkills: skills.map((s) => s.name),
    workerRating: averageRating,
    coverNote: app.coverNote,
    bidAmount: app.bidAmount,
    status: app.status,
    createdAt: app.createdAt
  };
}

// POST /api/v1/jobs
async function createJob(req, res, next) {
  try {
    const employer = await EmployerProfile.findOne({ userId: req.user.id });
    if (!employer) {
      return res.status(400).json(ApiResponse.error('Employer profile required before posting jobs.'));
    }

    const { title, description, jobType, dailyWage, minMonthlySalary, maxMonthlySalary, workingHours, estimatedDays, city, area, latitude, longitude, requiredSkillIds } = req.body;

    if (!title || !description || !city) {
      return res.status(400).json(ApiResponse.error('Title, description, and city are required.'));
    }

    const id = await getNextSequenceValue('jobs');
    const isRegular = jobType && (jobType.toUpperCase() === 'REGULAR' || jobType.toUpperCase() === 'REGULAR_EMPLOYMENT');

    let calculatedDailyWage = dailyWage != null ? Number(dailyWage) : null;
    if (isRegular && calculatedDailyWage == null) {
      if (minMonthlySalary != null) {
        calculatedDailyWage = Math.round((Number(minMonthlySalary) / 26) * 100) / 100;
      } else if (maxMonthlySalary != null) {
        calculatedDailyWage = Math.round((Number(maxMonthlySalary) / 26) * 100) / 100;
      }
    }

    const job = await Job.create({
      id,
      employerId: employer.id,
      title: title.trim(),
      description: description.trim(),
      jobType: isRegular ? 'REGULAR' : (jobType || 'DAILY_WAGE').toUpperCase(),
      dailyWage: calculatedDailyWage,
      minMonthlySalary: minMonthlySalary != null ? Number(minMonthlySalary) : null,
      maxMonthlySalary: maxMonthlySalary != null ? Number(maxMonthlySalary) : null,
      workingHours: workingHours || null,
      estimatedDays: estimatedDays != null ? Number(estimatedDays) : (isRegular ? 365 : 1),
      city: city.trim(),
      area: area || null,
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      status: 'OPEN',
      requiredSkillIds: Array.isArray(requiredSkillIds) ? requiredSkillIds.map(Number) : []
    });

    await logEvent(req.user, 'CREATE_JOB', 'Job', job.id, `Job posted: ${job.title}`, req);

    const dto = await mapJobToDto(job, employer);
    return res.status(200).json(ApiResponse.ok(dto, 'Job posted successfully.'));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/jobs/:id
async function updateJob(req, res, next) {
  try {
    const jobId = Number(req.params.id);
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Job not found with id: ' + jobId));
    }

    const employer = await EmployerProfile.findOne({ id: job.employerId });
    if (!employer || employer.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You do not have permission to modify this job post.'));
    }

    const { title, description, jobType, dailyWage, minMonthlySalary, maxMonthlySalary, workingHours, estimatedDays, city, area, latitude, longitude, requiredSkillIds } = req.body;

    if (title) job.title = title.trim();
    if (description) job.description = description.trim();
    if (jobType) {
      const isRegular = jobType.toUpperCase() === 'REGULAR' || jobType.toUpperCase() === 'REGULAR_EMPLOYMENT';
      job.jobType = isRegular ? 'REGULAR' : jobType.toUpperCase();
    }
    if (dailyWage !== undefined) job.dailyWage = dailyWage != null ? Number(dailyWage) : null;
    if (minMonthlySalary !== undefined) job.minMonthlySalary = minMonthlySalary != null ? Number(minMonthlySalary) : null;
    if (maxMonthlySalary !== undefined) job.maxMonthlySalary = maxMonthlySalary != null ? Number(maxMonthlySalary) : null;
    if (workingHours !== undefined) job.workingHours = workingHours;
    if (estimatedDays !== undefined) job.estimatedDays = Number(estimatedDays);
    if (city) job.city = city.trim();
    if (area !== undefined) job.area = area;
    if (latitude !== undefined) job.latitude = latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) job.longitude = longitude != null ? Number(longitude) : null;
    if (requiredSkillIds !== undefined) job.requiredSkillIds = Array.isArray(requiredSkillIds) ? requiredSkillIds.map(Number) : [];

    await job.save();
    const dto = await mapJobToDto(job, employer);
    return res.status(200).json(ApiResponse.ok(dto, 'Job updated successfully.'));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/jobs/:id
async function closeJob(req, res, next) {
  try {
    const jobId = Number(req.params.id);
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Job not found with id: ' + jobId));
    }

    const employer = await EmployerProfile.findOne({ id: job.employerId });
    if (!employer || employer.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You do not own this job post.'));
    }

    job.status = 'CLOSED';
    await job.save();

    const dto = await mapJobToDto(job, employer);
    return res.status(200).json(ApiResponse.ok(dto, 'Job closed successfully.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/jobs
async function searchJobs(req, res, next) {
  try {
    const { status, city, jobType, skillId, minWage, maxWage, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = {};
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }
    if (city && city.trim() && city.trim().toLowerCase() !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (jobType && jobType.trim() && jobType.trim().toUpperCase() !== 'ALL') {
      const jt = jobType.trim().toUpperCase();
      if (jt === 'REGULAR' || jt === 'REGULAR_EMPLOYMENT') {
        filter.jobType = { $in: ['REGULAR', 'REGULAR_EMPLOYMENT'] };
      } else {
        filter.jobType = jt;
      }
    }
    if (skillId && !isNaN(skillId)) {
      filter.requiredSkillIds = Number(skillId);
    }

    const wageConditions = [];
    if (minWage && !isNaN(minWage)) {
      wageConditions.push({
        $or: [
          { dailyWage: { $gte: Number(minWage) } },
          { minMonthlySalary: { $gte: Number(minWage) } }
        ]
      });
    }
    if (maxWage && !isNaN(maxWage)) {
      wageConditions.push({
        $or: [
          { dailyWage: { $lte: Number(maxWage) } },
          { maxMonthlySalary: { $lte: Number(maxWage) } }
        ]
      });
    }
    if (wageConditions.length > 0) {
      filter.$and = (filter.$and || []).concat(wageConditions);
    }

    if (query && query.trim()) {
      const pattern = new RegExp(query.trim(), 'i');
      const queryCond = {
        $or: [{ title: pattern }, { description: pattern }, { city: pattern }]
      };
      filter.$and = (filter.$and || []).concat([queryCond]);
    }

    const totalElements = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const employerIds = [...new Set(jobs.map((j) => j.employerId))];
    const employers = await EmployerProfile.find({ id: { $in: employerIds } });
    const empMap = new Map(employers.map((e) => [e.id, e]));

    const dtos = await Promise.all(jobs.map((j) => mapJobToDto(j, empMap.get(j.employerId))));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/jobs/my-jobs & /my
async function getEmployerJobs(req, res, next) {
  try {
    const employer = await EmployerProfile.findOne({ userId: req.user.id });
    if (!employer) {
      return res.status(404).json(ApiResponse.error('Employer profile not found.'));
    }

    const { status, city, jobType, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = { employerId: employer.id };
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }
    if (city && city.trim() && city.trim().toLowerCase() !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (jobType && jobType.trim() && jobType.trim().toUpperCase() !== 'ALL') {
      const jt = jobType.trim().toUpperCase();
      if (jt === 'REGULAR' || jt === 'REGULAR_EMPLOYMENT') {
        filter.jobType = { $in: ['REGULAR', 'REGULAR_EMPLOYMENT'] };
      } else {
        filter.jobType = jt;
      }
    }
    if (query && query.trim()) {
      const pattern = new RegExp(query.trim(), 'i');
      filter.$or = [{ title: pattern }, { description: pattern }];
    }

    const totalElements = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const dtos = await Promise.all(jobs.map((j) => mapJobToDto(j, employer)));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/jobs/:id
async function getJobById(req, res, next) {
  try {
    const jobId = Number(req.params.id);
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Job not found with id: ' + jobId));
    }
    const employer = await EmployerProfile.findOne({ id: job.employerId });
    const dto = await mapJobToDto(job, employer);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/jobs/:id/apply
async function applyForJob(req, res, next) {
  try {
    const worker = await WorkerProfile.findOne({ userId: req.user.id });
    if (!worker) {
      return res.status(400).json(ApiResponse.error('Worker profile must be created before applying for jobs.'));
    }

    const jobId = Number(req.params.id);
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Job not found with id: ' + jobId));
    }

    if (job.status !== 'OPEN') {
      return res.status(400).json(ApiResponse.error(`This job is no longer accepting applications (Status: ${job.status}).`));
    }

    const existingApp = await JobApplication.findOne({ jobId: job.id, workerId: worker.id });
    if (existingApp) {
      return res.status(400).json(ApiResponse.error('You have already applied for this job.'));
    }

    const { coverNote, bidAmount } = req.body;
    const id = await getNextSequenceValue('job_applications');

    const application = await JobApplication.create({
      id,
      jobId: job.id,
      workerId: worker.id,
      coverNote: coverNote || '',
      bidAmount: bidAmount != null ? Number(bidAmount) : job.dailyWage,
      status: 'APPLIED'
    });

    await logEvent(req.user, 'APPLY_JOB', 'JobApplication', application.id, `Applied for job: ${job.title}`, req);

    const dto = await mapApplicationToDto(application, job, worker);
    return res.status(200).json(ApiResponse.ok(dto, 'Application submitted successfully.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/jobs/:id/applications
async function getJobApplications(req, res, next) {
  try {
    const jobId = Number(req.params.id);
    const job = await Job.findOne({ id: jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Job not found with id: ' + jobId));
    }

    const employer = await EmployerProfile.findOne({ id: job.employerId });
    if (!employer || employer.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error("Unauthorized: You cannot view applications for another employer's job."));
    }

    const { status, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = { jobId: job.id };
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }

    let apps = await JobApplication.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const workerIds = apps.map((a) => a.workerId);
      const workers = await WorkerProfile.find({ id: { $in: workerIds } });
      const userIds = workers.map((w) => w.userId);
      const users = await User.find({ id: { $in: userIds } });
      const userMap = new Map(users.map((u) => [u.id, u]));
      const workerMap = new Map(workers.map((w) => [w.id, w]));

      apps = apps.filter((a) => {
        const w = workerMap.get(a.workerId);
        const u = w ? userMap.get(w.userId) : null;
        const nameMatch = u && u.fullName.toLowerCase().includes(qLower);
        const headlineMatch = w && w.headline && w.headline.toLowerCase().includes(qLower);
        const noteMatch = a.coverNote && a.coverNote.toLowerCase().includes(qLower);
        return nameMatch || headlineMatch || noteMatch;
      });
    }

    const totalElements = apps.length;
    const paginated = apps.slice(page * size, (page + 1) * size);

    const workerIds = [...new Set(paginated.map((a) => a.workerId))];
    const workers = await WorkerProfile.find({ id: { $in: workerIds } });
    const workerMap = new Map(workers.map((w) => [w.id, w]));

    const dtos = await Promise.all(paginated.map((a) => mapApplicationToDto(a, job, workerMap.get(a.workerId))));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/jobs/applications/my-applications
async function getMyApplications(req, res, next) {
  try {
    const worker = await WorkerProfile.findOne({ userId: req.user.id });
    if (!worker) {
      return res.status(404).json(ApiResponse.error('Worker profile not found.'));
    }

    const { status, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = { workerId: worker.id };
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }

    let apps = await JobApplication.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const jobIds = apps.map((a) => a.jobId);
      const jobs = await Job.find({ id: { $in: jobIds } });
      const empIds = jobs.map((j) => j.employerId);
      const emps = await EmployerProfile.find({ id: { $in: empIds } });
      const empMap = new Map(emps.map((e) => [e.id, e]));
      const jobMap = new Map(jobs.map((j) => [j.id, j]));

      apps = apps.filter((a) => {
        const j = jobMap.get(a.jobId);
        const emp = j ? empMap.get(j.employerId) : null;
        const titleMatch = j && j.title.toLowerCase().includes(qLower);
        const cityMatch = j && j.city.toLowerCase().includes(qLower);
        const empMatch = emp && emp.companyName.toLowerCase().includes(qLower);
        return titleMatch || cityMatch || empMatch;
      });
    }

    const totalElements = apps.length;
    const paginated = apps.slice(page * size, (page + 1) * size);

    const jobIds = [...new Set(paginated.map((a) => a.jobId))];
    const jobs = await Job.find({ id: { $in: jobIds } });
    const jobMap = new Map(jobs.map((j) => [j.id, j]));

    const dtos = await Promise.all(paginated.map((a) => mapApplicationToDto(a, jobMap.get(a.jobId), worker)));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/jobs/applications/:id/status
async function updateApplicationStatus(req, res, next) {
  try {
    const applicationId = Number(req.params.id);
    const application = await JobApplication.findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json(ApiResponse.error('Application not found with id: ' + applicationId));
    }

    const job = await Job.findOne({ id: application.jobId });
    if (!job) {
      return res.status(404).json(ApiResponse.error('Associated job not found.'));
    }

    const employer = await EmployerProfile.findOne({ id: job.employerId });
    if (!employer || employer.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You do not own the job associated with this application.'));
    }

    const newStatus = (req.body.status || '').toUpperCase();
    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json(ApiResponse.error('Invalid application status: ' + newStatus));
    }

    application.status = newStatus;
    await application.save();

    if (newStatus === 'ACCEPTED') {
      job.status = 'IN_PROGRESS';
      await job.save();
    }

    const worker = await WorkerProfile.findOne({ id: application.workerId });
    const dto = await mapApplicationToDto(application, job, worker);

    return res.status(200).json(ApiResponse.ok(dto, 'Applicant status updated.'));
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/jobs/applications/:id/withdraw
async function withdrawApplication(req, res, next) {
  try {
    const applicationId = Number(req.params.id);
    const application = await JobApplication.findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json(ApiResponse.error('Application not found with id: ' + applicationId));
    }

    const worker = await WorkerProfile.findOne({ id: application.workerId });
    if (!worker || worker.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You can only withdraw your own applications.'));
    }

    application.status = 'WITHDRAWN';
    await application.save();

    return res.status(200).json(ApiResponse.ok('WITHDRAWN', 'Application withdrawn successfully.'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createJob,
  updateJob,
  closeJob,
  searchJobs,
  getEmployerJobs,
  getJobById,
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
  mapJobToDto,
  mapApplicationToDto
};

